import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';
import MainPricing from '../components/MainPricing';
import { Helmet } from 'react-helmet-async';
export default function Pricing() {
  // Query the user profile to get any needed data
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('authToken');

  // Number of free MOT checks used
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;

  // Mutation to create a Stripe (or other) checkout session
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  // Handle purchasing credits for MOT / Valuation / Full History
  const handlePurchase = async (product, quantity) => {
    const productMap = {
      VALUATION: 'VALUATION',
      MOT: 'MOT',
      FULL_HISTORY: 'FULL_HISTORY',
    };
    const creditType = productMap[product] || 'FULL_HISTORY';

    try {
      const { data } = await createSession({ variables: { creditType, quantity } });
      if (data.createCreditPurchaseSession) {
        // Redirect user to payment URL
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
       <Helmet>
            <title>HPI Check Pricing | Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks</title>
            <meta name="description" content="HPI Check Pricing | FREE MOT History, Vehicle Valuations & Full HPI/VDI style Vehicle History Data — All in One Place" />
    
            {/* Open Graph tags for social sharing */}
            <meta property="og:title" content="Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks" />
            <meta property="og:description" content="HPI Check Pricing | FREE MOT History, Vehicle Valuations & Full HPI/VDI style Vehicle History Data — All in One Place" />
            
            <meta property="og:url" content="https://vehicledatainformation.co.uk" />
            <meta property="og:type" content="website" />
    
            {/* Twitter Card tags */}
            <meta name="twitter:title" content="Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks" />
            <meta name="twitter:description" content="HPI Check Pricing | FREE MOT History, Vehicle Valuations & Full HPI/VDI style Vehicle History Data — All in One Place" />
          
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="google-site-verification" content="jg1WMN4AdyYhyigF3HnV1UZszOTW2FNslHlylX7Ds4I" />
          </Helmet>
    <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #1560bd !important;
        }
      `}</style>
      <div style={{ marginTop: '2rem' }}>
      <MainPricing
        isLoggedIn={isLoggedIn}
        hasUsedFreeMOT={freeMotChecksUsed >= 3}
        onPurchase={handlePurchase}
      />
    </div></>
  );
}
