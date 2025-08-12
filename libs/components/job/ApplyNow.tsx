// components/jobs/ApplyNow.tsx
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import axios from 'axios';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { getJwtToken } from '../../auth';
import { APPLY_JOB } from '../../../apollo/user/mutation';


type Props = {
  jobId: string;
  applyUrl?: string | null;
  alreadyApplied?: boolean;
};

export default function ApplyNow({ jobId, applyUrl, alreadyApplied }: Props) {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [open, setOpen] = useState(false);
  const [resumeKey, setResumeKey] = useState<string>(''); // server path/ID after upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [memberPhone, setMemberPhone] = useState(user?.memberPhone || '');
  const [expectedSalary, setExpectedSalary] = useState<string>('');
  const [links, setLinks] = useState<string>('');
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [applyJob, { loading }] = useMutation(APPLY_JOB, {
    onCompleted: async () => {
      await sweetMixinSuccessAlert('Application submitted');
      setOpen(false);
      router.replace(router.asPath); // refresh data (e.g., mark as applied)
    },
    onError: async (e) => sweetMixinErrorAlert(e.message),
  });

  // External apply with tracking
  const handleExternal = async () => {
    try {
      // optional: await track via mutation
      window.open(applyUrl!, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  const handleClick = () => {
    if (applyUrl) return handleExternal();
    if (!user?._id) {
      router.push({ pathname: '/account/login', query: { next: `/jobs/${jobId}?apply=1` } });
      return;
    }
    setOpen(true);
  };

  const uploadResume = async (file: File) => {
    const token = getJwtToken();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('operations', JSON.stringify({
        query: `mutation FileUploader($file: Upload!, $target: String!) { fileUploader(file: $file, target: $target) }`,
        variables: { file: null, target: 'resume' },
      }));
      fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
      fd.append('0', file);

      const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', 'apollo-require-preflight': true, Authorization: `Bearer ${token}` },
      });

      if (res.data?.errors?.length) throw new Error(res.data.errors[0].message);
      const key = res.data?.data?.fileUploader as string;
      if (!key) throw new Error('Resume upload failed');
      setResumeKey(key);
      await sweetMixinSuccessAlert('Resume uploaded');
    } catch (e: any) {
      await sweetMixinErrorAlert(e.message || 'Upload failed');
      setResumeKey('');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!consent) return sweetMixinErrorAlert('Please agree to data processing.');
    await applyJob({
      variables: {
        input: {
          jobId,
          resumeKey,
          coverLetter: coverLetter.trim() || null,
          contactPhone: memberPhone.trim() || null,
          expectedSalary: expectedSalary ? Number(expectedSalary) : null,
          portfolioLinks: links ? links.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
      },
    });
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        disabled={alreadyApplied}
        sx={{ borderRadius: 2, px: 3, py: 1.25 }}
      >
        {applyUrl ? 'Apply on Company Site' : alreadyApplied ? 'Applied' : 'Apply Now'}
      </Button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply to this job</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setResumeFile(f);
                  if (f) uploadResume(f);
                }}
              />
              {uploading && <CircularProgress size={18} />}
            </Stack>

            <TextField
              label="Contact email"
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Expected salary (optional)"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value.replace(/[^\d]/g, ''))}
              size="small"
              fullWidth
              inputMode="numeric"
            />
            <TextField
              label="Portfolio links (comma separated, optional)"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Cover letter (optional)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />

            <FormControlLabel
              control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
              label="I agree to share my application details with the employer."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={onSubmit} disabled={loading || !resumeKey} variant="contained">
            {loading ? 'Submitting…' : 'Submit application'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
