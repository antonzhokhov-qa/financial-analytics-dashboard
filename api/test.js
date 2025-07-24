const handler = (req, res) => {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  res.status(200).json({ 
    message: 'API работает!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}

module.exports = handler 