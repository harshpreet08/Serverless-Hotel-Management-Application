import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
import { cognitoAppClient, cognitoDomainName, cognitoRedirectUri } from '../config';
import { GET_SECURITY_QUESTIONS, VALIDATE_SECURITY_QUESTIONS } from '../APIs';
import Loader from './Loader';

const SecurityQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Token Exchange --> Authorization Grant
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("CODE -->", code)
        async function fetchToken() {
            console.log("Redirect URI  ", cognitoRedirectUri)
            const tokenEndpoint = `https://${cognitoDomainName}.auth.us-east-1.amazoncognito.com/oauth2/token`;
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            const data = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: cognitoAppClient,
                code: code,
                redirect_uri: cognitoRedirectUri,
            })
            try {
                setTimeout(()=>{console.log("waiting")},3000)
                const response = await axios.post(tokenEndpoint, data, { headers })
                const { access_token } = response.data;
                localStorage.setItem('accessToken', access_token);
                localStorage.setItem('isAuthCompleted', false)
                console.log(access_token)
                fetchQuestions();
            }
            catch (error) {
                console.log('Error exchanging code for tokens - RETRYING ', error)
                toast.error("Unexpected error encountered - try login again");
            };
        }

        fetchToken();
    }, [])

    const fetchQuestions = async () => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(GET_SECURITY_QUESTIONS, { headers: {Authorization: `Bearer ${accessToken}`}});
            setQuestions(response.data.securityQuestions);
        } catch (error) {
            console.error('Error fetching security questions', error);
            setError('Failed to fetch security questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (questionIndex, value) => {
        setAnswers({
            ...answers,
            [questionIndex]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const accessToken = localStorage.getItem('accessToken');
        console.log("AccessToken-----> ",accessToken)
        const userAnswers = questions.map((question, index) => ({
            question: question.question,
            answer: CryptoJS.SHA256(answers[index]).toString()
        }));

        try {
            const response = await axios.post(VALIDATE_SECURITY_QUESTIONS, {answers: userAnswers}, {headers: {Authorization: `Bearer ${accessToken}`}});
            console.log(response);
            if (response.status === 200) {
                toast.success('Security questions answered correctly!');
                setTimeout(() => {
                    navigate('/cipher-challenge');
                }, 4000)
            }
        } catch (error) {
            console.error('Error verifying security answers', error);
            if (error.response.status === 400) {
                toast.error('Incorrect answers to security questions.');
            }
            else
                toast.error('Failed to verify answers. Please try again.');
        }
    };

    if (loading) {
        return <Loader />
      }
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Answer Security Questions</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {questions.map((question, index) => (
                        <div key={index}>
                            <label className="block text-gray-700">{question.question}</label>
                            <input
                                type="text"
                                value={answers[index] || ''}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                            />
                        </div>
                    ))}
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Submit Answers</button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
};

export default SecurityQuestions;
