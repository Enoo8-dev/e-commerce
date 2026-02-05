module.exports = (req, res, next) => {
    // blocco tutte le chiamate POST, PUT, DELETE, PATCH se sono in ambiente demo
    if (process.env.NODE_ENV === 'demo' && req.method !== 'GET') {
        return res.status(403).json({ 
            message: 'Funzionalità di modifica disabilitata in modalità DEMO.' 
        });
    }
    next();
};