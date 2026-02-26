import express, { type Request, type Response } from 'express';
import path from 'path';

const app = express();
const PORT = 3000;
const __dirname = import.meta.dirname;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

const brigadeMembers = [
    { id: '1', name: "Заплітна Анна"},
    { id: '2', name: "Кисельов Дмитро"},
    { id: '3', name: "Горячева Анастасія"},
    { id: '4', name: "Содолинський Михайло"}
];

app.get('/student/:id', (req: Request, res: Response) => {
    const studentId = req.params.id;
    const student = brigadeMembers.find(m => m.id === studentId);

    if (student) {
        res.render('student', { student });
    } else {
        res.status(404).send('Студента не знайдено в списку нашої бригади.');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер успішно запущено: http://localhost:${PORT}`);
});