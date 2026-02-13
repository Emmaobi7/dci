import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './index';
import { FaCreditCard, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { usePaystackScript } from '../hooks/usePaystackScript';

const PaymentModal = ({ course, isOpen, onClose, onPaymentSuccess }) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const processingTimeoutRef = useRef(null);

  // Load Paystack script manually
  const { loaded: scriptLoaded, error: scriptError } = usePaystackScript();

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('PaymentModal: Opening (Raw JS Mode)...');
      setProcessing(false);
      setIsSuccess(false);
    }
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    };
  }, [isOpen]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handlePaystackSuccess = useCallback((reference) => {
    console.log('[URGENT] PaymentModal: RAW JS SUCCESS CALLBACK FIRED!', reference);
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);

    setProcessing(false);
    setIsSuccess(true);

    setTimeout(() => {
      console.log('[URGENT] PaymentModal: Signaling completion to parent...');
      if (onPaymentSuccess) onPaymentSuccess();
    }, 1000);
  }, [onPaymentSuccess]);

  const handlePaystackClose = useCallback(() => {
    console.log('[URGENT] PaymentModal: RAW JS CLOSE CALLBACK FIRED');
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    setProcessing(false);
    setIsSuccess(false);
  }, []);

  const handlePayment = () => {
    console.log('PaymentModal: handlePayment triggered');
    setProcessing(true);

    if (course.price === 0) {
      // Free course logic
      setTimeout(() => {
        setProcessing(false);
        if (onPaymentSuccess) onPaymentSuccess();
      }, 1000);
      return;
    }

    // Check if script is ready
    if (!scriptLoaded) {
      alert("Payment system is still loading. Please try again in a moment.");
      setProcessing(false);
      return;
    }

    if (scriptError) {
      alert("Failed to load payment system. Please check your internet connection.");
      setProcessing(false);
      return;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert("Paystack Public Key is missing! Check .env file.");
      setProcessing(false);
      return;
    }

    try {
      console.log('PaymentModal: Initializing Raw PaystackPop...');

      const paystackHandler = window.PaystackPop.setup({
        key: publicKey,
        email: user?.email || "user@email.com",
        amount: Math.round((course?.price || 0) * 100), // kobo
        currency: 'NGN',
        ref: (new Date()).getTime().toString(), // Unique ref every time
        callback: function (response) {
          handlePaystackSuccess(response);
        },
        onClose: function () {
          handlePaystackClose();
        }
      });

      paystackHandler.openIframe();

      // Increased safety timeout (5 minutes)
      processingTimeoutRef.current = setTimeout(() => {
        if (!isSuccess) {
          console.warn('PaymentModal: Safety timeout reached.');
          setProcessing(false);
        }
      }, 300000);

    } catch (err) {
      console.error('PaymentModal: Error initializing PaystackPop:', err);
      alert("Could not open payment window. Please disable popup blockers.");
      setProcessing(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white font-mono">ENROLL IN COURSE</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Course Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-white mb-2">{course.title}</h4>
          <p className="text-gray-300 text-sm mb-3">{course.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">by {course.instructorName}</span>
            <span className="text-teal-400 font-bold font-mono">
              {course.price === 0 ? 'FREE' : formatPrice(course.price)}
            </span>
          </div>
        </div>

        {/* Free Course */}
        {course.price === 0 ? (
          <div className="text-center">
            <div className="text-green-400 text-4xl mb-4">🎉</div>
            <p className="text-green-400 font-bold mb-4">This course is FREE!</p>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  ENROLLING...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  ENROLL NOW
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Paid Course */
          <div>
            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-gray-300 font-bold mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaCreditCard className="mr-2 text-teal-400" />
                  <span className="text-gray-300">Pay with Paystack</span>
                </label>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Course Price:</span>
                <span className="text-white font-bold">{formatPrice(course.price)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
                <span className="text-white font-bold">Total:</span>
                <span className="text-teal-400 font-bold text-lg">{formatPrice(course.price)}</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={processing || isSuccess || (!scriptLoaded && !scriptError)}
              className={`w-full transition-all duration-300 ${isSuccess
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700'
                } text-white`}
            >
              {isSuccess ? (
                <>
                  <FaCheck className="mr-2" />
                  PAYMENT SUCCESSFUL!
                </>
              ) : processing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <FaCreditCard className="mr-2" />
                  PAY {formatPrice(course.price)}
                </>
              )}
            </Button>

            {/* Stuck Helper */}
            {processing && (
              <p className="mt-4 text-xs text-gray-500 text-center animate-pulse">
                Don't see the payment window? <button onClick={() => setProcessing(false)} className="text-teal-400 underline underline-offset-2">Click here to retry</button>
              </p>
            )}

            {/* Script Loading Helper */}
            {!scriptLoaded && !scriptError && (
              <p className="mt-2 text-xs text-gray-400 text-center">
                <FaSpinner className="inline animate-spin mr-1" /> Loading secure payment system...
              </p>
            )}
          </div>
        )}

        {/* Security Note */}
        <p className="text-gray-500 text-xs text-center mt-4">
          🔒 Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
