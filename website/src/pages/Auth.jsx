import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { supabase } from "../services";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({ email: email });
      if (error) throw error;
      alert("Check your email for the login link!");
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body1">
        Sign in via magic link with your email
      </Typography>
      <TextField
        id="email"
        label="Email"
        variant="outlined"
        onChange={(event) => {
          setEmail(event.target.value);
        }}
      />
      <Button
        variant="contained"
        disabled={email ? false : true}
        onClick={handleLogin}
      >
        {loading ? <CircularProgress /> : "Send magic link"}
      </Button>
    </Stack>
  );
}
