import { spawn, exec } from 'child_process';

function child (resolve, reject) {
    const ls = exec('dir');
    let text = '';

    ls.stdout.on('data', (data) => {
        text += data;
    });

    ls.on('close', (code) => {
        resolve(text);
    });
}

export default { dir: new Promise(child) };
