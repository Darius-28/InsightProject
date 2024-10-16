import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  makeStyles,
  Theme,
  Grid,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DropzoneDialog } from 'material-ui-dropzone';

interface IFormInput {
  title: string;
  description: string;
  priority: string;
  email: string;
  stepsToReproduce: string;
}

type AISuggestionField = 'title' | 'priority' | 'stepsToReproduce';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().required('Priority is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  stepsToReproduce: yup.string(),
});

interface FileWithPreview {
  file: File;
  preview: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(30), // Adjust this value to move the form down
    padding: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(6),
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  submitButton: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  filePreview: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    padding: theme.spacing(2, 0),
    maxWidth: '100%',
  },
  gridList: {
    width: '100%',
    margin: 0,
  },
  gridListTile: {
    width: '100% !important',
    [theme.breakpoints.up('sm')]: {
      width: '50% !important',
    },
    [theme.breakpoints.up('md')]: {
      width: '33.33% !important',
    },
    [theme.breakpoints.up('lg')]: {
      width: '25% !important',
    },
    padding: theme.spacing(1),
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
  previewText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
  },
  tileBar: {
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  textField: {
    '& .MuiInputLabel-filled': {
      transform: 'translate(12px, 6px) scale(0.75)',
      fontSize: '1.2rem',
      color: theme.palette.primary.main,
    },
    '& .MuiFilledInput-root': {
      backgroundColor: theme.palette.background.paper,
      '&.Mui-focused, &:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.Mui-focused:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    '& .MuiFilledInput-input': {
      fontSize: '1.1rem',
    },
    '& .Mui-focused .MuiInputLabel-filled': {
      color: theme.palette.primary.main,
    },
    '& .Mui-error .MuiInputLabel-filled': {
      color: theme.palette.primary.main,
    },
    '& .Mui-error .MuiFilledInput-underline:after': {
      borderBottomColor: theme.palette.primary.main,
    },
  },
  formControl: {
    width: '100%',
    '& .MuiInputLabel-filled': {
      transform: 'translate(12px, 6px) scale(0.75)',
      fontSize: '1.2rem',
      color: theme.palette.primary.main,
    },
    '& .MuiFilledInput-root': {
      backgroundColor: theme.palette.background.paper,
      '&.Mui-focused, &:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.Mui-focused:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    '& .MuiSelect-select': {
      fontSize: '1.1rem',
    },
    '& .Mui-focused .MuiInputLabel-filled': {
      color: theme.palette.primary.main,
    },
    '& .Mui-error .MuiInputLabel-filled': {
      color: theme.palette.primary.main,
    },
    '& .Mui-error .MuiFilledInput-underline:after': {
      borderBottomColor: theme.palette.primary.main,
    },
  },
  menuItem: {
    fontSize: '1rem', // Increased menu item font size
  },
  aiSuggestion: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  aiButton: {
    marginRight: theme.spacing(1),
  },
  aiAssistButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  revertButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

const TicketForm: React.FC = () => {
  const classes = useStyles();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [openDropzone, setOpenDropzone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<AISuggestionField, string>>({
    title: '',
    priority: '',
    stepsToReproduce: '',
  });
  const [aiFeedback, setAiFeedback] = useState<Record<AISuggestionField, boolean | null>>({
    title: null,
    priority: null,
    stepsToReproduce: null,
  });
  const [suggestionsMade, setSuggestionsMade] = useState(false);
  const [originalInputs, setOriginalInputs] = useState<Partial<IFormInput>>({});
  const [fieldStates, setFieldStates] = useState<Record<AISuggestionField, 'original' | 'ai'>>({
    title: 'original',
    priority: 'original',
    stepsToReproduce: 'original',
  });
  const [descriptionLength, setDescriptionLength] = useState(0);
  const suggestionsRequestedRef = useRef(false);

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<IFormInput>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      description: '',
    },
  });

  // Watch the description field
  const description = watch('description');

  const requestAiSuggestions = useCallback(async () => {
    if (suggestionsMade || suggestionsRequestedRef.current) return;

    suggestionsRequestedRef.current = true;

    // TODO: Implement API call to get AI suggestions
    // For now, we'll use mock data
    const mockSuggestions: Record<AISuggestionField, string> = {
      title: 'AI Suggested Title',
      priority: 'High',
      stepsToReproduce: '1. Step one\n2. Step two\n3. Step three',
    };
    
    setAiSuggestions(mockSuggestions);
    setSuggestionsMade(true);
    
    toast.info(`AI suggestions are ready. Click 'AI Assist' to apply them.`);
  }, [suggestionsMade]);

  useEffect(() => {
    const length = description?.length ?? 0;
    setDescriptionLength(length);
    if (length > 10 && !suggestionsMade && !suggestionsRequestedRef.current) {
      requestAiSuggestions();
    } else if (length === 0) {
      setSuggestionsMade(false);
      suggestionsRequestedRef.current = false;
      setFieldStates({
        title: 'original',
        priority: 'original',
        stepsToReproduce: 'original',
      });
    }
  }, [description, requestAiSuggestions, suggestionsMade]);

  const toggleAiSuggestion = (field: AISuggestionField) => {
    if (descriptionLength === 0) return; // Prevent toggling if description is empty

    if (fieldStates[field] === 'original') {
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

  const provideFeedback = useCallback((field: AISuggestionField, isHelpful: boolean) => {
    setAiFeedback(prev => ({ ...prev, [field]: isHelpful }));
    
    if (!isHelpful) {
      // If feedback is negative (thumbs down), revert to original input
      const originalValue = originalInputs[field as keyof IFormInput] || '';
      setValue(field as keyof IFormInput, originalValue);
      setAiSuggestions(prev => ({ ...prev, [field]: '' }));
      toast.info(`AI suggestion for ${field} has been removed. Reverted to your original input.`);
    } else {
      toast.success(`Thank you for your feedback on the ${field} suggestion`);
    }
    
    // TODO: Send feedback to AI service
  }, [setValue, originalInputs]);

  useEffect(() => {
    const description = watch('description');
    if (description.length > 10 && !suggestionsMade) {
      requestAiSuggestions();
    }
  }, [watch('description'), requestAiSuggestions, suggestionsMade]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!validateEmail(data.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      files.forEach((fileWithPreview, index) => {
        formData.append(`attachments`, fileWithPreview.file);
      });
      Object.entries(aiSuggestions).forEach(([key, value]) => {
        formData.append(`aiSuggestion_${key}`, value);
      });
      Object.entries(aiFeedback).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(`aiFeedback_${key}`, value.toString());
        }
      });

      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      const result = await response.json();
      console.log(result);
      toast.success('Ticket submitted successfully!');
      
      reset();
      setFiles([]);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFiles = (newFiles: File[]) => {
    const newFilesWithPreview = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...newFilesWithPreview]);
    setOpenDropzone(false);
  };

  const handleDeleteFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className={classes.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    {...field}
                    label="Title"
                    variant="filled"
                    fullWidth
                    placeholder='Please provide a concise title for your issue.'
                    error={!!error}
                    helperText={error?.message}
                    className={classes.textField}
                  />
                  <Button
                    onClick={() => toggleAiSuggestion('title')}
                    disabled={!suggestionsMade || descriptionLength === 0}
                    style={{ marginLeft: '10px', minWidth: '100px' }}
                    className={fieldStates.title === 'original' ? classes.aiAssistButton : classes.revertButton}
                  >
                    {fieldStates.title === 'original' ? 'AI Assist' : 'Revert'}
                  </Button>
                </div>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  minRows={4}
                  variant="filled"
                  fullWidth
                  placeholder='Please provide a detailed description of the issue.'
                  error={!!error}
                  helperText={error?.message}
                  className={classes.textField}
                  onChange={(e) => {
                    field.onChange(e);
                    setDescriptionLength(e.target.value.length);
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="priority"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl variant="filled" className={classes.formControl} error={!!error} fullWidth>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      {...field}
                      labelId="priority-label"
                      id="priority"
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                  <Button
                    onClick={() => toggleAiSuggestion('priority')}
                    disabled={!suggestionsMade || descriptionLength === 0}
                    style={{ marginLeft: '10px', minWidth: '100px' }}
                    className={fieldStates.priority === 'original' ? classes.aiAssistButton : classes.revertButton}
                  >
                    {fieldStates.priority === 'original' ? 'AI Assist' : 'Revert'}
                  </Button>
                </div>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  variant="filled"
                  fullWidth
                  placeholder='Please provide your email address so we can contact you.'
                  error={!!error}
                  helperText={error?.message}
                  className={classes.textField}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="stepsToReproduce"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <TextField
                    {...field}
                    label="Steps to Reproduce"
                    multiline
                    minRows={4}
                    variant="filled"
                    fullWidth
                    placeholder='If applicable, please provide steps to reproduce the issue.'
                    error={!!error}
                    helperText={error?.message}
                    className={classes.textField}
                  />
                  <Button
                    onClick={() => toggleAiSuggestion('stepsToReproduce')}
                    disabled={!suggestionsMade || descriptionLength === 0}
                    style={{ marginLeft: '10px', minWidth: '100px' }}
                    className={fieldStates.stepsToReproduce === 'original' ? classes.aiAssistButton : classes.revertButton}
                  >
                    {fieldStates.stepsToReproduce === 'original' ? 'AI Assist' : 'Revert'}
                  </Button>
                </div>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="default"
              onClick={() => setOpenDropzone(true)}
            >
              Attach Files
            </Button>
          </Grid>

          {files.length > 0 && (
            <div className={classes.filePreview}>
              <GridList cellHeight={180} className={classes.gridList} cols={1} spacing={0}>
                {files.map((fileWithPreview, index) => (
                  <GridListTile key={index} className={classes.gridListTile}>
                    {fileWithPreview.file.type.startsWith('image/') ? (
                      <img src={fileWithPreview.preview} alt={fileWithPreview.file.name} className={classes.previewImg} />
                    ) : (
                      <div className={classes.previewText}>
                        <Typography variant="body1">{fileWithPreview.file.name}</Typography>
                      </div>
                    )}
                    <GridListTileBar
                      title={fileWithPreview.file.name}
                      actionIcon={
                        <IconButton
                          className={classes.icon}
                          onClick={() => handleDeleteFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      className={classes.tileBar}
                    />
                  </GridListTile>
                ))}
              </GridList>
            </div>
          )}

          <Grid item xs={12}>
            <DropzoneDialog
              open={openDropzone}
              onSave={handleSaveFiles}
              acceptedFiles={['image/*', '.pdf']}
              showPreviews={true}
              maxFileSize={5000000}
              onClose={() => setOpenDropzone(false)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              className={classes.submitButton}
            >
              Submit
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </Grid>
        </Grid>
      </form>
      <ToastContainer />
    </div>
  );
};

export default TicketForm;
