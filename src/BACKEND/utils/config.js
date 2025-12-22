// Environment configuration validation
const requiredEnvVars = [
    'MONGO_URI'
];

const validateEnvironment = () => {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing);
        console.log('💡 Please check your .env file in the BACKEND directory');
        console.log('📁 Current working directory:', process.cwd());
        console.log('🔍 Looking for .env file at:', require('path').join(process.cwd(), '.env'));
        process.exit(1);
    }
    
    console.log('✅ Environment configuration validated');
};

const getConfig = () => {
    return {
        port: process.env.PORT || 5000,
        mongoUri: process.env.MONGO_URI,
        nodeEnv: process.env.NODE_ENV || 'development',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET
    };
};

module.exports = {
    validateEnvironment,
    getConfig
};