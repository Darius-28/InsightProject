import React, { useState, useEffect } from 'react';
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
  Typography,
  makeStyles,
  Theme,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { DropzoneDialog } from 'material-ui-dropzone';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IFormInput {
  title: string;
  description: string;
  priority: string;
  email: string;
  stepsToReproduce: string;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().required('Priority is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  stepsToReproduce: yup.string(),
});

interface FileWithPreview {
  file: File;
  preview: string;
}

const useStyles = makeStyles((theme: Theme) => ({
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
}));

const TicketForm: React.FC = () => {
  const classes = useStyles();
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<IFormInput>({
    resolver: yupResolver(schema)
  });
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [openDropzone, setOpenDropzone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      formData.append('email', data.email);
      formData.append('stepsToReproduce', data.stepsToReproduce);

      files.forEach((fileWithPreview, index) => {
        formData.append(`attachments`, fileWithPreview.file);
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <Controller
          name="title"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              multiline
              minRows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="priority"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.priority}>
              <InputLabel>Priority</InputLabel>
              <Select {...field}>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
              {errors.priority && <Typography color="error">{errors.priority.message}</Typography>}
            </FormControl>
          )}
        />

        <Controller
          name="email"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="stepsToReproduce"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Steps to Reproduce"
              multiline
              minRows={4}
              error={!!errors.stepsToReproduce}
              helperText={errors.stepsToReproduce?.message}
              fullWidth
            />
          )}
        />

        <Button
          variant="contained"
          color="default"
          onClick={() => setOpenDropzone(true)}
        >
          Attach Files
        </Button>

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

        <DropzoneDialog
          open={openDropzone}
          onSave={handleSaveFiles}
          acceptedFiles={['image/*', '.pdf']}
          showPreviews={true}
          maxFileSize={5000000}
          onClose={() => setOpenDropzone(false)}
        />

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
      </form>
      <ToastContainer />
    </>
  );
};

export default TicketForm;