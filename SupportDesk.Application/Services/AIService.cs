using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using SupportDesk.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;
using System.Collections.Generic;

namespace SupportDesk.Application.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiUrl = "https://api.openai.com/v1/chat/completions";
        private readonly string _apiKey;
        private readonly ILogger<AIService> _logger;
        private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

        public AIService(IConfiguration configuration, HttpClient httpClient, ILogger<AIService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            _apiKey = configuration["AI:OpenAIApiKey"];
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("OpenAI API key is missing or empty in the configuration.");
                throw new InvalidOperationException("OpenAI API key is not configured.");
            }

            _retryPolicy = Policy
                .Handle<HttpRequestException>()
                .OrResult<HttpResponseMessage>(r => r.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                .WaitAndRetryAsync(3, retryAttempt => 
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    onRetry: (outcome, timespan, retryAttempt, context) =>
                    {
                        logger.LogWarning($"Attempt {retryAttempt}: Retrying in {timespan.TotalSeconds} seconds");
                    });
        }

        public async Task<string> QueryAsync(string input)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, _apiUrl)
                {
                    Headers = 
                    {
                        { "Authorization", $"Bearer {_apiKey}" }
                    },
                    Content = new StringContent(JsonConvert.SerializeObject(new 
                    {
                        model = "gpt-4o-mini",
                        messages = new[]
                        {
                            new { role = "system", content = "You are a helpful assistant." },
                            new { role = "user", content = input }
                        },
                        max_tokens = 150,
                        temperature = 0.7
                    }), Encoding.UTF8, "application/json")
                };

                var response = await _retryPolicy.ExecuteAsync(() => _httpClient.SendAsync(request));
                var responseBody = await response.Content.ReadAsStringAsync();

                _logger.LogInformation($"Raw API Response: {responseBody}");

                if (!response.IsSuccessStatusCode)
                {
                    return $"Error: {response.StatusCode} - {responseBody}";
                }

                var result = JsonConvert.DeserializeObject<OpenAIResponse>(responseBody);
                return result.Choices[0].Message.Content.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in QueryAsync");
                return $"Error: {ex.Message}";
            }
        }

        public async Task<string> GenerateTitleAsync(string description)
        {
            return await QueryAsync($"Generate a concise title for this support ticket based on the description: {description}");
        }

        public async Task<string> GeneratePriorityAsync(string description)
        {
            return await QueryAsync($"Based on the following support ticket description, suggest an appropriate priority level (Low, Medium, High, or Critical). Only respond with one of these four priority levels. Description: {description}");
        }

        public async Task<string> GenerateStepsToReproduceAsync(string description)
        {
            return await QueryAsync($"Generate steps to reproduce the issue described in this support ticket: {description}");
        }

        public async Task<string> GetSuggestionAsync(string prompt)
        {
            return await QueryAsync(prompt);
        }

        public async Task<string> SuggestCategoryAsync(string description)
        {
            string prompt = $"Based on the following support ticket description, suggest the most appropriate category. Respond with a single category name. Description: {description}";
            string response = await QueryAsync(prompt);
            return response.Trim();
        }
    }

    public class OpenAIResponse
    {
        public Choice[] Choices { get; set; }
    }

    public class Choice
    {
        public Message Message { get; set; }
    }

    public class Message
    {
        public string Content { get; set; }
    }
}
