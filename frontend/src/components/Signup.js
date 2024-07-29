import React, { useState } from 'react';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CryptoJS from 'crypto-js';
import { cognitoAppClient, cognitoUserPool } from '../config';
import { CONFIRM_USER, USER_SIGN_UP } from '../APIs';
import { useNavigate } from 'react-router-dom';

const securityQuestions = [
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you live on in third grade?",
  "What is your oldest sibling’s birthday month and year?",
  "What is the middle name of your youngest child?"
];

const Signup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [securityQuestion1, setSecurityQuestion1] = useState(securityQuestions[0]);
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState(securityQuestions[1]);
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const [securityQuestion3, setSecurityQuestion3] = useState(securityQuestions[2]);
  const [securityAnswer3, setSecurityAnswer3] = useState('');
  const [isPropertyAgent, setIsPropertyAgent] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const poolData = {
      UserPoolId: cognitoUserPool,
      ClientId: cognitoAppClient
    };

    const userPool = new CognitoUserPool(poolData);

    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email })
    ];

    userPool.signUp(email, password, attributeList, null, async (err, result) => {
      if (err) {
        toast.error(err.message || JSON.stringify(err));
        return;
      }

      const hashedAnswers = [
        CryptoJS.SHA256(securityAnswer1).toString(),
        CryptoJS.SHA256(securityAnswer2).toString(),
        CryptoJS.SHA256(securityAnswer3).toString()
      ];

      const userDetails = {
        username: email,
        address,
        phone,
        securityQuestions: [
          { question: securityQuestion1, answer: hashedAnswers[0] },
          { question: securityQuestion2, answer: hashedAnswers[1] },
          { question: securityQuestion3, answer: hashedAnswers[2] }
        ],
        user_role: isPropertyAgent ? 'property_agent' : 'registered_user'
      };

      try {
        await axios.post(CONFIRM_USER, { username: email });
        await axios.post(USER_SIGN_UP, userDetails);
        toast.success('User signed up successfully!');
        setTimeout(() => {
          navigate('/')
        }, 3000);
      } catch (error) {
        console.error('Error storing user details', error);
        toast.error('Failed to store user details. Please try again.');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ backgroundImage: 'url(your-image-url)', backgroundSize: 'cover' }}>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email:</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-gray-700">Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-gray-700">Address:</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-gray-700">Phone:</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div className="flex items-center">
            <label className="block text-gray-700">Property Agent:</label>
            <input
              type="checkbox"
              checked={isPropertyAgent}
              onChange={() => setIsPropertyAgent(!isPropertyAgent)}
              className="ml-2 h-6 w-6"
            />
          </div>
          <div>
            <label className="block text-gray-700">Security Question 1:</label>
            <select value={securityQuestion1} onChange={(e) => setSecurityQuestion1(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              {securityQuestions.map((question, index) => (
                <option key={index} value={question}>{question}</option>
              ))}
            </select>
            <input type="text" value={securityAnswer1} onChange={(e) => setSecurityAnswer1(e.target.value)} required placeholder="Answer" className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-gray-700">Security Question 2:</label>
            <select value={securityQuestion2} onChange={(e) => setSecurityQuestion2(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              {securityQuestions.map((question, index) => (
                <option key={index} value={question}>{question}</option>
              ))}
            </select>
            <input type="text" value={securityAnswer2} onChange={(e) => setSecurityAnswer2(e.target.value)} required placeholder="Answer" className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-gray-700">Security Question 3:</label>
            <select value={securityQuestion3} onChange={(e) => setSecurityQuestion3(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              {securityQuestions.map((question, index) => (
                <option key={index} value={question}>{question}</option>
              ))}
            </select>
            <input type="text" value={securityAnswer3} onChange={(e) => setSecurityAnswer3(e.target.value)} required placeholder="Answer" className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <button type="submit" disabled={loading}
            className={`w-full py-2 px-4 rounded ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
          >
            Sign Up
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
