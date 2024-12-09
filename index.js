import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();

const porta = 8080;
const host = 'localhost';

let usuarios = []; 
let mensagens = []; 


app.use(session({
    secret: 'M1nh4Chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 30 
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./publicas'));


function verificarAutenticacao(req, res, next) {
    if (req.session.usuarioLogado) {
        next();
    } else {
        res.redirect('/login.html');
    }
}


app.get('/login.html', (req, res) => {
    res.send(`
        <html>
            <head><title>Login</title></head>
            <body>
                <form method="POST" action="/login.html">
                    <label>Usuário: <input type="text" name="usuario" required></label><br>
                    <label>Senha: <input type="password" name="senha" required></label><br>
                    <button type="submit">Login</button>
                </form>
            </body>
        </html>
    `);
});


app.post('/login.html', (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === '1234') {
        req.session.usuarioLogado = true;
        res.cookie('dataHoraUltimoLogin', new Date().toLocaleString(), { maxAge: 1000 * 60 * 30 });
        res.redirect('/');
    } else {
        res.send('Usuário ou senha inválidos! <a href="/login.html">Tentar novamente</a>');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});


app.get('/', verificarAutenticacao, (req, res) => {
    const ultimoAcesso = req.cookies.dataHoraUltimoLogin || 'Primeiro acesso';
    res.send(`
        <html>
            <head><title>Menu</title></head>
            <body>
                <h1>Bem-vindo, Admin</h1>
                <p>Último acesso: ${ultimoAcesso}</p>
                <ul>
                    <li><a href="/usuarios">Gerenciar Usuários</a></li>
                    <li><a href="/batepapo">Bate-Papo</a></li>
                    <li><a href="/logout">Sair</a></li>
                </ul>
            </body>
        </html>
    `);
});


app.get('/usuarios', verificarAutenticacao, (req, res) => {
    res.send(`
        <html>
            <head><title>Cadastro de Usuários</title></head>
            <body>
                <h1>Cadastro de Usuários</h1>
                <form method="POST" action="/usuarios">
                    <label>Nome: <input type="text" name="nome" required></label><br>
                    <label>Apelido: <input type="text" name="apelido" required></label><br>
                    <button type="submit">Cadastrar</button>
                </form>
                <h2>Usuários Cadastrados:</h2>
                <ul>
                    ${usuarios.map(u => `<li>${u.nome} (${u.apelido})</li>`).join('')}
                </ul>
                <a href="/">Voltar</a>
            </body>
        </html>
    `);
});


app.post('/usuarios', verificarAutenticacao, (req, res) => {
    const { nome, apelido } = req.body;
    if (nome && apelido) {
        usuarios.push({ nome, apelido });
        res.redirect('/usuarios');
    } else {
        res.send('Todos os campos são obrigatórios! <a href="/usuarios">Voltar</a>');
    }
});

app.get('/batepapo', verificarAutenticacao, (req, res) => {
    res.send(`
        <html>
            <head><title>Bate-Papo</title></head>
            <body>
                <h1>Bate-Papo</h1>
                <form method="POST" action="/batepapo">
                    <label>Usuário:
                        <select name="usuario" required>
                            ${usuarios.map(u => `<option value="${u.apelido}">${u.apelido}</option>`).join('')}
                        </select>
                    </label><br>
                    <label>Mensagem: <textarea name="mensagem" required></textarea></label><br>
                    <button type="submit">Enviar</button>
                </form>
                <h2>Mensagens:</h2>
                <ul>
                    ${mensagens.map(m => `<li><strong>${m.usuario}:</strong> ${m.texto} <em>(${m.dataHora})</em></li>`).join('')}
                </ul>
                <a href="/">Voltar</a>
            </body>
        </html>
    `);
});


app.post('/batepapo', verificarAutenticacao, (req, res) => {
    const { usuario, mensagem } = req.body;
    if (usuario && mensagem) {
        const dataHora = new Date().toLocaleString();
        mensagens.push({ usuario, texto: mensagem, dataHora });
        res.redirect('/batepapo');
    } else {
        res.send('Usuário e mensagem são obrigatórios! <a href="/batepapo">Voltar</a>');
    }
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
