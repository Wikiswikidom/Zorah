# Authentication

Supabase Auth will support email/password and Google OAuth. Email verification and secure password reset are required. Sessions must use the provider's secure mechanisms and be handled consistently across server and client boundaries.

Authentication is separate from authorization: a logged-in user is not automatically an admin.

Account flows: sign up → verification → sign in → session → profile completion; reset password → verified recovery → new credential; OAuth → provider callback → account/profile synchronization.

Errors should be user-friendly without exposing whether sensitive accounts exist.