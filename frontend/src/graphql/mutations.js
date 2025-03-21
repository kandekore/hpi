// frontend/src/graphql/mutations.js
import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register(
    $email: String!
    $password: String!
    $username: String
    $phone: String
    $userIntention: String
    $termsAccepted: Boolean!
    $captchaToken: String!
  ) {
    register(
      email: $email
      password: $password
      username: $username
      phone: $phone
      userIntention: $userIntention
      termsAccepted: $termsAccepted
      captchaToken: $captchaToken
    )
  }
`;

export const RESEND_VERIFICATION = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;


export const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $captchaToken: String!) {
    login(email: $email, password: $password, captchaToken: $captchaToken)
  }
`;

export const CREATE_CREDIT_PURCHASE_SESSION = gql`
  mutation CreateCreditPurchaseSession($creditType: String!, $quantity: Int!) {
    createCreditPurchaseSession(creditType: $creditType, quantity: $quantity)
  }
`;

// The useMOTCredit mutation
// export const USE_MOT_CREDIT = gql`
//   mutation UseMOTCredit {
//     useMOTCredit {
//       id
//       motCredits
//       freeMotChecksUsed
//     }
//   }
// `;
export const PAY_MOT_CREDIT = gql`
  mutation PayMotCredit {
    payMOTCredit {
      id
      motCredits
      freeMotChecksUsed
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
