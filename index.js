const express = require("express");
const path = require("path");
const cors = require('cors'); // 🛑 1. CORS Package ထည့်သွင်း 🛑
const validasi = require("./lib/validasi");
const countryList = require("./utils/data.json");

const PORT = process.env.PORT || 3000;
const app = express();

// ---------------------------------------------
// 2. CORS Configuration (Network Error ဖြေရှင်းရန် - Domain များ ထပ်ထည့်)
// ---------------------------------------------
// www ပါတာ၊ www မပါတာ နှစ်မျိုးလုံးကို ခွင့်ပြုရန်
const allowedOrigins = [
    'https://www.mrchitnaw.com', 
    'https://mrchitnaw.com', // 🛑 www မပါတဲ့ domain ကို ထပ်ထည့်လိုက်ပါပြီ 🛑
    'http://localhost:8080'
];

const corsOptions = {
    // ခေါ်ဆိုလာသော Domain သည် allowedOrigins ထဲတွင် ရှိမရှိ စစ်ဆေးခြင်း
    origin: function (origin, callback) {
        // origin မရှိရင် (Same-origin သို့မဟုတ် non-browser request) ခွင့်ပြု
        if (!origin) return callback(null, true); 
        
        // allowedOrigins list ထဲမှာ ပါရင် ခွင့်ပြု
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // မပါဝင်ပါက CORS Error ပေးပို့
            callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
        }
    },
    methods: 'POST', // POST Method ကိုသာ ခွင့်ပြု
    optionsSuccessStatus: 200 // အောင်မြင်မှု အခြေအနေ
};

app.use(cors(corsOptions)); 
// ---------------------------------------------
// 3. Middlewares
// ---------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // JSON body ကို parse လုပ်ဖို့
app.use(express.urlencoded({ extended: true })); // form-urlencoded body ကို parse လုပ်ဖို့


// ---------------------------------------------
// 4. API Endpoint: POST /checkid
// ---------------------------------------------
app.post("/checkid", async (req, res) => {
    try {
        const id = req.body.user_id;
        const serverid = req.body.server_id;

        if (id && serverid) {
            let response = await validasi(id, serverid);

            // API မှ လိုချင်သော Format အတိုင်း ပြန်ပို့ခြင်း
            return res.json({
                success: true,
                username: response['in-game-nickname'],
                region: countryList.find(a => a.countryShortCode == response.country)?.countryName || "Unknown"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "User ID or Server ID is missing."
            });
        }
    } catch (e) {
        console.error("Validation Error:", e);
        return res.status(500).json({
            success: false,
            message: e?.message || e || "ID validation failed due to unknown error."
        });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
});