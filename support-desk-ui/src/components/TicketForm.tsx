import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  FormHelperText,
  CircularProgress,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DropzoneDialog } from 'material-ui-dropzone';
import { toast } from 'react-toastify';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { debounce } from '../utils';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    padding: theme.spacing(10, 2),
    backgroundColor: theme.palette.background.default,
  },
  paper: {
    padding: theme.spacing(3),
    width: '50%',
    backgroundColor: theme.palette.common.white,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  suggestionContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  input: {
    '& .MuiInputLabel-filled': {
      color: theme.palette.common.black,
      transform: 'translate(12px, 6px) scale(0.75)',
    },
  },
  descriptionContainer: {
    position: 'relative',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    right: '14px', // Adjust this value as needed
    transform: 'translateY(-50%)',
    pointerEvents: 'none', // This ensures the spinner doesn't interfere with text input
  },
  filePreview: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  attachmentContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    minHeight: 150, // Ensure there's enough vertical space
  },
  attachmentItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 120, // Adjust this value as needed
  },
  attachmentPreview: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  attachmentName: {
    maxWidth: 100,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
}));

interface IFormInput {
  title: string;
  description: string;
  priority: string;
  email: string;
  stepsToReproduce: string;
}

type AISuggestionField = 'title' | 'priority' | 'stepsToReproduce';

const MIN_CHARS_FOR_AI_SUGGESTION = 15;

const TicketForm: React.FC = () => {
  const classes = useStyles();
  const [openDropzone, setOpenDropzone] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    title: string;
    priority: string;
    stepsToReproduce: string;
  }>({ title: '', priority: '', stepsToReproduce: '' });
  const [fieldStates, setFieldStates] = useState<Record<AISuggestionField, 'original' | 'ai'>>({
    title: 'original',
    priority: 'original',
    stepsToReproduce: 'original'
  });
  const [originalInputs, setOriginalInputs] = useState<Partial<IFormInput>>({});
  const [aiLoading, setAiLoading] = useState(false);

  const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    priority: yup.string().required('Priority is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    stepsToReproduce: yup.string().required('Steps to reproduce are required'),
  });

  const { control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<IFormInput>({
    resolver: yupResolver(schema),
  });

  const descriptionValue = watch('description');

  const [debouncedRequestAiSuggestions] = useState(() =>
    debounce(async (description: string) => {
      if (!description || description.length < MIN_CHARS_FOR_AI_SUGGESTION) {
        setAiSuggestions({ title: '', priority: '', stepsToReproduce: '' });
        setFieldStates({
          title: 'original',
          priority: 'original',
          stepsToReproduce: 'original'
        });
        return;
      }

      setAiLoading(true);
      try {
        const response = await fetch('/api/tickets/ai/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI suggestions');
        }

        const suggestions = await response.json();
        setAiSuggestions(suggestions);
      } catch (error) {
        console.error('Error getting AI suggestions:', error);
        toast.error('Failed to generate AI suggestions. Please try again.');
      } finally {
        setAiLoading(false);
      }
    }, 500)
  );

  useEffect(() => {
    if (!descriptionValue || descriptionValue.length === 0) {
      // Clear AI suggestions when the description is empty
      setAiSuggestions({ title: '', priority: '', stepsToReproduce: '' });
      setFieldStates({
        title: 'original',
        priority: 'original',
        stepsToReproduce: 'original'
      });
    } else if (descriptionValue.length >= MIN_CHARS_FOR_AI_SUGGESTION) {
      debouncedRequestAiSuggestions(descriptionValue);
    }
  }, [descriptionValue, debouncedRequestAiSuggestions]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }
      // Include AI suggestions
      formData.append('aiSuggestedTitle', aiSuggestions.title);
      formData.append('aiSuggestedPriority', aiSuggestions.priority);
      formData.append('aiSuggestedSteps', aiSuggestions.stepsToReproduce);

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast.success('Ticket created successfully!');
      // Reset form and state
      reset();
      setFiles([]);
      setAiSuggestions({ title: '', priority: '', stepsToReproduce: '' });
      setFieldStates({
        title: 'original',
        priority: 'original',
        stepsToReproduce: 'original'
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while submitting the ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setOpenDropzone(false);
  };

  const handleFileDelete = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAttachmentPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <img src={URL.createObjectURL(file)} alt={file.name} className={classes.attachmentPreview} />;
    } else {
      return (
        <div className={classes.attachmentPreview}>
          <Typography variant="body2" align="center">
            No preview
          </Typography>
        </div>
      );
    }
  };

  const handleApplySuggestion = (field: AISuggestionField) => {
    if (fieldStates[field] === 'original') {
      setOriginalInputs(prev => ({ ...prev, [field]: watch(field) }));
      setValue(field as keyof IFormInput, aiSuggestions[field]);
      setFieldStates(prev => ({ ...prev, [field]: 'ai' }));
      toast.info(`AI suggestion applied for ${field}`);
    } else {
      const originalValue = originalInputs[field as keyof IFormInput] || '';
      setValue(field as keyof IFormInput, originalValue);
      setFieldStates(prev => ({ ...prev, [field]: 'original' }));
      toast.info(`Reverted to original input for ${field}`);
    }
  };

  return (
    <div className={classes.formContainer}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Create a New Ticket
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    className={classes.input}
                    label="Title"
                    variant="filled"
                    fullWidth
                    placeholder="Enter a title for your ticket"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
              {aiSuggestions.title && (
                <div className={classes.suggestionContainer}>
                  <Typography variant="body2">
                    AI Suggestion: {aiSuggestions.title}
                  </Typography>
                  <Button
                    startIcon={<AutorenewIcon />}
                    onClick={() => handleApplySuggestion('title')}
                    color={fieldStates.title === 'ai' ? 'primary' : 'default'}
                    size="small"
                  >
                    {fieldStates.title === 'ai' ? 'Revert' : 'Apply AI'}
                  </Button>
                </div>
              )}
            </Grid>

            <Grid item xs={12}>
              <div className={classes.descriptionContainer}>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className={classes.input}
                      label="Description"
                      variant="filled"
                      fullWidth
                      multiline
                      minRows={4}
                      placeholder="Describe the issue, add more details for better AI suggestions"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        // This will trigger the useEffect hook to call debouncedRequestAiSuggestions
                      }}
                    />
                  )}
                />
                {aiLoading && (
                  <CircularProgress
                    size={20}
                    className={classes.loadingIndicator}
                  />
                )}
              </div>
            </Grid>

            <Grid item xs={12}>
              <FormControl variant="filled" fullWidth error={!!errors.priority} className={classes.input}>
                <InputLabel>Priority</InputLabel>
                <Controller
                  name="priority"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Priority"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>Select Priority</em>
                      </MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <FormHelperText error>{errors.priority.message}</FormHelperText>
                )}
              </FormControl>
              {aiSuggestions.priority && (
                <div className={classes.suggestionContainer}>
                  <Typography variant="body2">
                    AI Suggestion: {aiSuggestions.priority}
                  </Typography>
                  <Button
                    startIcon={<AutorenewIcon />}
                    onClick={() => handleApplySuggestion('priority')}
                    color={fieldStates.priority === 'ai' ? 'primary' : 'default'}
                    size="small"
                  >
                    {fieldStates.priority === 'ai' ? 'Revert' : 'Apply AI'}
                  </Button>
                </div>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    className={classes.input}
                    label="Email"
                    variant="filled"
                    fullWidth
                    placeholder="Enter your email address"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="stepsToReproduce"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    className={classes.input}
                    label="Steps to Reproduce"
                    variant="filled"
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="Describe the steps to reproduce the issue"
                    error={!!errors.stepsToReproduce}
                    helperText={errors.stepsToReproduce?.message}
                  />
                )}
              />
              {aiSuggestions.stepsToReproduce && (
                <div className={classes.suggestionContainer}>
                  <Typography variant="body2">
                    AI Suggestion: {aiSuggestions.stepsToReproduce}
                  </Typography>
                  <Button
                    startIcon={<AutorenewIcon />}
                    onClick={() => handleApplySuggestion('stepsToReproduce')}
                    color={fieldStates.stepsToReproduce === 'ai' ? 'primary' : 'default'}
                    size="small"
                  >
                    {fieldStates.stepsToReproduce === 'ai' ? 'Revert' : 'Apply AI'}
                  </Button>
                </div>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenDropzone(true)}
              >
                Upload Files
              </Button>
            </Grid>

            {files.length > 0 && (
              <Grid item xs={12} className={classes.filePreview}>
                <Typography variant="h6" gutterBottom>Attached Files:</Typography>
                <div className={classes.attachmentContainer}>
                  {files.map((file, index) => (
                    <div key={index} className={classes.attachmentItem}>
                      {renderAttachmentPreview(file)}
                      <Typography variant="caption" className={classes.attachmentName}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption">
                        {formatFileSize(file.size)}
                      </Typography>
                      <IconButton size="small" onClick={() => handleFileDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <DropzoneDialog
          open={openDropzone}
          onSave={handleFileChange}
          acceptedFiles={['image/*', '.log']}
          showPreviews={true}
          maxFileSize={5000000}
          onClose={() => setOpenDropzone(false)}
        />
      </Paper>
    </div>
  );
};

export default TicketForm;
