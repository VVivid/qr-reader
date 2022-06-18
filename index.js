const express = require("express");
const axios = require('axios')
const jimp = require('jimp')
const jsQR = require('jsqr')

const app = express();
const port = 3000;

app.use(express.json())

app.post("/webhook", async (req, res) => {
     console.log(req.body.message)
      try {
      const fileId = req.body.message.photo[1].file_id;
      const msgId = req.body.message.from.id;
      const width = req.body.message.photo[1].width;
      const height = req.body.message.photo[1].height;
      const botToken = process.env.BOT_TOKEN;
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
      res.sendStatus(200)
      return
    } catch (error) {
      console.log(error);
      res.sendStatus(200)
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
