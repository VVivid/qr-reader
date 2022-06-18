const express = require("express");
const axios = require('axios')
const jimp = require('jimp')
const jsQR = require('jsqr')

const app = express();
const port = process.env.PORT || 3000 
const botToken = process.env.BOT_TOKEN;

app.use(express.json())

app.get("/", (req,res) => {
    res.status(200).json({
        mes:"hi"
    })
})

app.post("/webhook", async (req, resp) => {
      console.log(req.body.message.photo[1])
      try {
      const msgId = req.body.message.from.id;
      const fileId = req.body.message.photo[1].file_id;
      const width = req.body.message.photo[1].width;
      const height = req.body.message.photo[1].height;
      const data = await axios.get(
        `https://api.telegram.org/bot${botToken}/getFile`,
        {
          params: {
            file_id: fileId,
          },
        },
      );
      const filePath = data.data.result.file_path;
      const res = await axios.get(
        `https://api.telegram.org/file/bot${botToken}/${filePath}`,
        {
          responseType: 'arraybuffer',
        },
      );
      const bitMap = jimp.decoders['image/jpeg'](res.data);
      const imageData = new Uint8ClampedArray(bitMap.data.buffer);
      const decode = jsQR(imageData, width, height).data;
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: msgId,
        text: decode,
      });
    } catch (error) {
      console.log(error);
    }
      resp.sendStatus(200)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
