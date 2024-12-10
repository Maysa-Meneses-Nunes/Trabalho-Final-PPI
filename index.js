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
        <style>
        body {
            display: flex;justify-content: center;align-items: center; height: 100vh;
            margin: 0;font-family: Arial, sans-serif;background-color: #f4f4f9; }
        .login-container {
         background-color: white;padding: 20px;border-radius: 8px;
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);text-align: center;}
        input {
             width: 100%;padding: 8px;margin: 10px 0;border-radius: 4px;border: 1px solid #ccc;
        }
        button {
            width: 100%;padding: 8px;background-color: #007bff; color: white;border: none; border-radius: 4px; }
    </style>
        <div class="login-container">
            <body>
                <form method="POST" action="/login.html">
                    <label>Usuário: <input type="text" name="usuario" required></label><br>
                    <label>Senha: <input type="password" name="senha" required></label><br>
                    <button type="submit">Login</button>
                </form>
            </body>
            </div>
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
        <style>
        body {
            font-family: Arial, sans-serif;background-color: #f4f4f9;margin: 0; padding: 0;
            display: flex; justify-content: center;align-items: center; height: 100vh;}
        .menu-container { background-color: white; padding: 30px;border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);text-align: center;  width: 300px; }
        h1 {  color: #007bff;margin-bottom: 20px;}
        p { font-size: 16px;margin-bottom: 20px;color: #555;}
        ul {list-style-type: none;padding: 0;}
        li { margin: 15px 0;}
        a {  text-decoration: none;color: #007bff; font-size: 18px; transition: color 0.3s ease;}
        a:hover { color: #0056b3; }
        .logout-link {  color: #ff0000;  }
        .logout-link:hover {color: #cc0000}
    </style>
            <head><title>sala de bate-papo</title></head>

            <body>
            <div class="menu-container">
                <h1>Bem-vindo</h1>
                <p>Último acesso: ${ultimoAcesso}</p>
                <ul>
                    <li><a href="/usuarios">Gerenciar Usuários</a></li>
                    <li><a href="/batepapo">Bate-Papo</a></li>
                    <li><a href="/logout">Sair</a></li>
               </ul>
                </div>
            </body>
        </html>
    `);
});


app.get('/usuarios', verificarAutenticacao, (req, res) => {
    res.send(`
        <html>
        <style>
        body {font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0;
         display: flex; flex-direction: column;align-items: center;justify-content: center;height: 100vh;}
        h1, h2 {color: #007bff;}
        form {background-color: white; padding: 20px; border-radius: 8px;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 30px;width: 300px;text-align: center;}
        label { display: block;margin-bottom: 10px; font-size: 16px;}
        input {width: 100%; padding: 8px;margin: 5px 0 15px 0;border-radius: 4px;border: 1px solid #ccc; }
        button {  width: 100%;  padding: 10px; background-color: #007bff; color: white;border: none; border-radius: 4px;cursor: pointer;}
         button:hover { background-color: #0056b3; }
        ul {list-style-type: none;padding: 0; width: 300px; margin-top: 20px; text-align: left;}
        li {background-color: white; margin-bottom: 8px; padding: 8px; border-radius: 4px;  border: 1px solid #ccc;}
        a {text-decoration: none;color: #007bff;font-size: 16px;margin-top: 20px;}
        a:hover { color: #0056b3;  }
    </style>
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
        <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; display: flex;flex-direction: column;align-items: center; justify-content: center; height: 100vh; }
        h1 { color: #007bff; margin-bottom: 20px;  }
        form { background-color: white;  padding: 20px;border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 30px;width: 300px;text-align: center; }
     label {display: block; margin-bottom: 10px;  font-size: 16px; }
        select, textarea { width: 100%;padding: 8px; margin: 5px 0 15px 0; border-radius: 4px;    border: 1px solid #ccc;  }
        button {width: 100%;  padding: 10px; background-color: #007bff; color: white;  border: none; border-radius: 4px;  cursor: pointer;}
       button:hover {
            background-color: #0056b3; }
        h2 {  color: #007bff;  }
        ul {list-style-type: none;padding: 0; width: 300px;  margin-top: 20px;  text-align: left;}
        li {
            background-color: white; margin-bottom: 8px;padding: 8px; border-radius: 4px; border: 1px solid #ccc; }
        a {text-decoration: none;color: #007bff;font-size: 16px; margin-top: 20px; }
        a:hover {color: #0056b3; }
    </style>
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
