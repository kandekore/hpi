import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password)
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
