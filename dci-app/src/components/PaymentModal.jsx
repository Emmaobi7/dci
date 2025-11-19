import React, { useState } from 'react';
import { Button } from './index';
import { FaCreditCard, FaTimes, FaSpinner, FaCheck } from 'react-icons/fa';

const PaymentModal = ({ course, isOpen, onClose, onPaymentSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Debug logging
  console.log('PaymentModal: Rendering with props:', { 
    isOpen, 
    courseTitle: course?.title,
    hasOnClose: !!onClose,
    hasOnPaymentSuccess: !!onPaymentSuccess 
  });

  if (!isOpen || !course) {
    console.log('PaymentModal: Not rendering - isOpen:', isOpen, 'course:', !!course);
    return null;
  }

  console.log('PaymentModal: Rendering modal for course:', course.title);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, integrate with Paystack:
      // const response = await paystackPayment({
      //   email: user.email,
      //   amount: course.price * 100, // Paystack uses kobo
      //   metadata: { courseId: course.id }
      // });
      
      console.log('Payment processed for course:', course.id);
      onPaymentSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle payment error
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white font-mono">ENROLL IN COURSE</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={processing}
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
                  <span className="text-gray-300">Debit/Credit Card</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="mr-2 text-teal-400">🏦</span>
                  <span className="text-gray-300">Bank Transfer</span>
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

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
            >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  PROCESSING PAYMENT...
                </>
              ) : (
                <>
                  <FaCreditCard className="mr-2" />
                  PAY {formatPrice(course.price)}
                </>
              )}
            </Button>
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
