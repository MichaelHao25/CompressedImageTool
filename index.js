const https = require('https');
const fs = require('fs');

const userName = '382899691@qq.com'
const key = '5k4wK9BHG4wmJLPzzJL0j4TX46Yw5S95'

if(!userName||!key){
    console.log('用户名或者key为空!');
}
const reg = new RegExp('.*?.(png|jpg)$', 'ig')
const readDir = (url, level) => {
    fs.readdir(url, {
        encoding: 'utf8',
    }, (err, files) => {
        if (err) {
            if (err.code == 'ENOTDIR') {
                if (reg.test(url)) {
                    console.log(`文件名为:${url}`);
                    let base64 = Buffer.from(`${userName}:${key}`).toString('base64');
                    let req = https.request({
                        method: 'post',
                        host: 'api.tinify.com',
                        path: '/shrink',
                        headers: {
                            Authorization: `Basic ${base64}`,
                        },
                    }, (res) => {
                        const { statusCode } = res;

                        if (statusCode !== 200) {
                            new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
                        }
                        res.setEncoding('utf8');
                        let rawData = '';
                        res.on('data', (chunk) => { rawData += chunk; });
                        res.on('end', () => {
                            const parsedData = JSON.parse(rawData);
                            console.log(parsedData.output.url);
                            downImg(parsedData.output.url, url)
                        });

                    })
                    fs.readFile(url, 'binary', function (err, file) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            console.log("输出文件");
                            req.write(file, 'binary');
                            req.end();
                        }
                    });
                }
            }
        }
        if (!level) {
            for (let index = 0; index < files.length; index++) {
                const element = files[index];
                if (element[0] != '.' || reg.test(element)) {
                    readDir(url + '/' + element, true);
                } else {
                    console.log(`非图片文件:${url + '/' + element}`);
                }
            }
        }
    });
}

const downImg = (url, name) => {
    console.log(`下载图片中...`);
    https
        .get(url, (req, res) => {
            var imgData = '';
            req.setEncoding('binary');
            req.on('data', function (chunk) {
                imgData += chunk
            })
            req.on('end', function () {
                fs.writeFile(name, imgData, 'binary', function (err) {  //path为本地路径例如public/logo.png
                    if (err) { console.log('保存出错！') } else {
                        console.log('保存成功!')
                    }
                })
            })
        })
};


readDir(__dirname);
