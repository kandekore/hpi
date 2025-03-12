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
  ) {
    register(
      email: $email
      password: $password
      username: $username
      phone: $phone
      userIntention: $userIntention
      termsAccepted: $termsAccepted
    )
  }
`;

export const RESEND_VERIFICATION = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;


export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
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