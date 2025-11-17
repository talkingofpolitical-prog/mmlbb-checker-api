const express = require("express");
const path = require("path");
const cors = require('cors'); // 🛑 1. CORS Package ထည့်သွင်း 🛑
const validasi = require("./lib/validasi");
const countryList = require("./utils/data.json");

const PORT = process.env.PORT || 3000;
const app = express();

// ---------------------------------------------
// 2. CORS Configuration (Network Error ဖြေရှင်းရန်)
// ---------------------------------------------

const allowedOrigins = [
    'https://www.mrchitnaw.com', // 🛑 သင့် Website Domain ကို ထည့်ပါ 🛑
    'http://localhost:8080' // Local testing အတွက်
];

const corsOptions = {
    // သင့် Domain များသာ ခေါ်ယူခွင့်ပြုရန်
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'POST', // POST Method ကိုပဲ ခွင့်ပြု
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 
// ---------------------------------------------
// 3. Middlewares
// ---------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // JSON body ကို parse လုပ်ဖို့
app.use(express.urlencoded({ extended: true })); // form-urlencoded body ကို parse လုပ်ဖို့ (AJAX data အတွက်)


// ---------------------------------------------
// 4. API Endpoint ကို POST /checkid သို့ ပြောင်းလဲ/အသစ်ထည့်သွင်း
// ---------------------------------------------
app.post("/checkid", async (req, res) => { // 🛑 /checkid endpoint ကို POST method ဖြင့် ပြောင်းလဲ 🛑
    try {
        // Data ကို Request Body မှ ယူခြင်း (AJAX POST data)
        const id = req.body.user_id;
        const serverid = req.body.server_id;

        if (id && serverid) {
            let response = await validasi(id, serverid);

            // API မှ လိုချင်သော Format အတိုင်း ပြန်ပို့ခြင်း
            return res.json({
                success: true, // Success status
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


// ---------------------------------------------
// 5. Existing /api/validasi GET endpoint ကို ဖယ်ရှား/အမည်ပြောင်းပါ (လိုချင်ရင်)
// ---------------------------------------------
// *သင့်ရဲ့ website က /checkid POST ကိုပဲ ခေါ်မှာဖြစ်လို့ ဒီအောက်က code ကို ဖယ်ရှားနိုင်ပါတယ်။*
/*
app.get("/api/validasi", async (req, res) => {
    // ... (Old GET logic) ...
});
*/


// Start the server
app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
});