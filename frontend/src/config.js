export const cognitoUserPool = "us-east-1_zaH8sOHX2"

export const cognitoAppClient = "2qtnp17ld1jl1fq8e8g8spsj02"

export const cognitoRedirectUri = process.env.REACT_APP_ENVIRONMENT === "production" ? "https://dal-vacation-home-jslxc6muqq-uc.a.run.app/security-questions" : "http://localhost:3000/security-questions"

export const cognitoDomainName = "dalhome-final-sdp-23"

export const cognitoLoginPath = `https://dalhome-final-sdp-23.auth.us-east-1.amazoncognito.com/login?client_id=2qtnp17ld1jl1fq8e8g8spsj02&response_type=code&scope=email+openid+phone&redirect_uri=${cognitoRedirectUri}`

console.log("ENVIRONMENT_ VARIABLES ", process.env.REACT_APP_ENVIRONMENT);
console.log("REDIRECT_URI is ---- ",cognitoRedirectUri);