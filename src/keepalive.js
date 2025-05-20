const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running.'));
app.listen(3000, () => console.log('KeepAlive server is live.'));
