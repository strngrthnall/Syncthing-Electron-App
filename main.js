const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');

// async function startSyncthing() {
//   console.log("Iniciando app...")
//   return new Promise(async (resolve, reject) => {
//     if (await isSyncthingRunning() == false) {
//       console.log("Rodando Syncthing...")
//       exec('wezterm start -- syncthing', (error, stdout, stderr) => {
//         console.log("Executando comando...")
//         if (error) {
//           console.error(`Erro ao executar comando: ${error.message}`)
//           reject(error)
//           return
//         }
//         if (stderr) {
//           console.log(`Erro: ${stderr}`)
//           reject(stderr)
//           return
//         }
//         if (stdout) {
//           console.log(`Syncthing rodando.`)
//           resolve(stdout)
//         }
//       })
//     } else {
//       resolve()
//     }
//   })
// }

function isSyncthingRunning() {
  console.log("Verificando se Syncthing está rodando...")
  return new Promise((resolve, reject) => {
    exec('ps aux | grep syncthing', (error, stdout, stderr) => {
      console.log("Procurando o syncthing...")
      
      if (error) {
        console.error(`Erro ao executar comando: ${error.message}`)
        reject(error)
        return
      }
      if (stderr) {
        console.error(`Erro: ${stderr}`);
        reject(stderr)
        return
      }

      if (stdout.includes('/usr/bin/syncthing')) {
        console.log(`Syncthing está rodando.`)
        resolve(true)
      } else {
        console.log(`Syncthing não está rodando.`)
        resolve(false)
      }
    })
  })
}

function getSyncthingPort() {
  return new Promise((resolve, reject) => {
    exec('lsof -i -P -n | grep syncthing', (error, stdout, stderr) => {
      if (error) {
          console.error(`Erro ao executar comando: ${error.message}`);
          reject(error);
          return;
      }
      if (stderr) {
          console.error(`Erro: ${stderr}`);
          reject(stderr);
          return;
      }
      if (stdout) {
          const lines = stdout.split('\n');
          lines.forEach(line => {
              const match = line.match(/TCP\s+([\d\.]+:\d+)\s+\(LISTEN\)/);
              if (match) {
                  console.log(`Syncthing está escutando em: ${match[1]}`);
                  resolve(match[1]);
                  return;
              }
          });
      } else {
          console.log('Não foi possível identificar a porta do Syncthing.');
          resolve(null)
      }
    });
  })
}

function createWindow(syncthingUrl) {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadURL('http://' + syncthingUrl + '/'); // Load the desired URL
};

app.whenReady().then(async () => {

  try {
    // await startSyncthing();
    const syncthingPort = await getSyncthingPort();
    if (isSyncthingRunning()) {
      createWindow(syncthingPort);
    } else {
      console.error('Não foi possível encontrar o Syncthing. Está rodando?')
    }
  } catch (e) {
    console.log(e);
  }
});