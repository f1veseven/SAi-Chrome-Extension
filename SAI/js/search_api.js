const preDom = document.querySelector('#mask_content');
const cbiDom = document.querySelector('#content_by_iframe');

function generateData(){
    let o = {
        "url": arguments[0],
        "title": arguments[1],
        "origin": arguments[2],
        "date": arguments[3],
        "detail": arguments.length >= 4 ? arguments[4] : '',
        "page": arguments.length >= 5 ? arguments[5] : '',
    }
    return o;
}

async function switchSApi(v, i, p){
    p = p ? parseInt(p) : 1;
    let fun = '';
    switch (i) {
        case 1: fun = 'maxSP';break;
        case 2: fun = 'maxWZ';break;
        case 3: fun = 'searchXZ';break;
        case 4: fun = 'searchAnQuanKe';break;
        case 5: fun = 'searchWYarticle';break;
        case 6: fun = 'maxLD';break;
        case 7: fun = 'searchWY';break;
        case 8: fun = 'searchSeeBug';break;
        case 9: fun = 'searchAnQuanKeCVE';break;
        case 10: fun = 'searchSaucsCVE';break;
        case 11: fun = 'searchFreebuf'; break;
        case 12: fun = 'searchHacking8';break;
        default:fun = 'maxSP';break;
    }
    return await window[fun](v, p);
}

async function maxSP(key, page){
    let ALL_LIST = [];
    const list = await Promise.all([
        searchXZ(key, page),
        searchAnQuanKe(key, page),
        searchWY(key, page),
        searchWYarticle(page, page),
        searchSeeBug(key, page),
        searchAnQuanKeCVE(key, page),
        searchSaucsCVE(key, page),
        searchFreebuf(key, page),
        searchHacking8(key, page),
    ]);
    for (let i of list){
        ALL_LIST = ALL_LIST.concat(i);
    }
    ALL_LIST = orderByDateNew(ALL_LIST);
    return ALL_LIST;
}
async function maxWZ(key, page){
    let ALL_LIST = [];
    const list = await Promise.all([
        searchXZ(key, page),
        searchAnQuanKe(key, page),
        searchWYarticle(page, page),
        searchFreebuf(key, page),
        searchHacking8(key, page),
    ]);
    for (let i of list){
        ALL_LIST = ALL_LIST.concat(i);
    }
    ALL_LIST = orderByDateNew(ALL_LIST);
    return ALL_LIST;
}
async function maxLD(key, page){
    let ALL_LIST = [];
    const list = await Promise.all([
        searchWY(key, page),
        searchSeeBug(key, page),
        searchAnQuanKeCVE(key, page),
        searchSaucsCVE(key, page),
    ]);
    for (let i of list){
        ALL_LIST = ALL_LIST.concat(i);
    }
    ALL_LIST = orderByDateNew(ALL_LIST);
    return ALL_LIST;
}

// ??????
function orderByDateNew(data_list){
    let list = data_list;
    for (let i=0;i < list.length -1;i++){
        for (let j=0;j < list.length - 1 - i;j++){
            if (new Date(list[j]['date']) < new Date(list[j+1]['date'])){
                let tmp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = tmp;
            }
        }
    }
    return list;
}

async function searchXZ(key, page){
    let list = [];
    if (!page || !key) return false;
    try{
        await fetch(`https://xz.aliyun.com/search?page=${page}&keyword=${encodeURI(key)}`)
        .then(async res => {
            let originPath = 'https://xz.aliyun.com';
            let html = await res.text();
            html = splitHtml(html, '<div id="includeList">', '<div class="pagination clearfix">');
            preDom.innerHTML = html;
            const tdDom = preDom.querySelectorAll('td');
            let L = [];
            if(tdDom){
                for(let item of tdDom){
                    let titleDom = item.querySelector('.topic-title');
                    let url = titleDom.href;
                    url = originPath + (url.substring(url.indexOf('/t/'), url.length));
                    let date = item.querySelector('.topic-info').innerHTML.toString().split('/ ')[1].substr(0,10);
                    let i = generateData(url, titleDom.innerHTML.trim(), "????????????", date, '',page);
                    L.push(i);
                }
            }
            list = L;
        })
    } catch (e){};
    if(list.length) console.log('search xz ok');
    return list;
}

async function searchAnQuanKe(key, page){
    let list = [];
    if (!page || !key) return false;
    try{
        await fetch(`https://api.anquanke.com/data/v1/search?page=${page}&size=20&s=${encodeURI(key)}`, {
            method: 'GET',
            headers: new Headers({
                "Accept": "application/json; charset=utf-8"
            }),
        })
        .then(async res => {
            let originPath = 'https://www.anquanke.com/post/id/';
            const {data} = await res.json();
            let L = [];
            if(data){
                for (let i of data){
                    let o = generateData(originPath + i.id, i.title, "?????????", i.date.substr(0,10), '',page);
                    L.push(o);
                }
            }
            list = L;
        })
    } catch (e){};
    if (list.length) console.log('search aqk ok');
    return list;
}

async function searchWY(key, page, type='by_bugs'){
    if (!page || !key) return false;
    let list = [];
    try{
        await fetch(`https://wooyun.website/list.php?keyword=${encodeURI(key)}&&p=${page}`)
        .then(async res => {
            let originPath = 'https://wooyun.website/';
            let html = await res.text();
            html = splitHtml(html, '<table class="table table-striped">', '</table>');
            preDom.innerHTML = '<table class="table table-striped">'+html+'</table>';
            let trDom = preDom.querySelectorAll('tr:nth-of-type(n+2)');
            let L = [];
            if(trDom.length){
                for(let item of trDom){
                    let tdDom = item.querySelectorAll('td');
                    let titleDom = tdDom[1].querySelector('a').innerHTML;
                    let url = tdDom[1].querySelector('a').href;
                    url = originPath + (url.substring(url.indexOf('static/'), url.length));
                    let date = tdDom[0].innerHTML;
                    let i = generateData(url, titleDom.trim(), "???????????????", date, '',page);
                    L.push(i);
                }
            }
            list = L;
        })
    } catch (e){};
    if(list.length) console.log('search wy ok');
    return list;
}

async function searchWYarticle(key, page){
    return searchWY(key, page, 'by_drops');
}

async function searchSeeBug(key, page){
    if (!page || !key) return false;
    let list = [];
    try{
        await fetch(`https://www.seebug.org/search/?keywords=${encodeURI(key)}&category=&page=${page}&level=all`)
        .then(async res => {
            let originPath = 'https://www.seebug.org';
            let html = await res.text();
            html = splitHtml(html, '<table class="table sebug-table table-vul-list">', '</table>');
            preDom.innerHTML = '<table class="table sebug-table table-vul-list">' + html +'</table>';
            let trDom = preDom.querySelectorAll('tbody > tr');
            let L = [];
            if(trDom.length){
                for(let item of trDom){
                    let aDom = item.querySelector('td.vul-title-wrapper > a');
                    let dDom = item.querySelector('td.datetime');
                    let url = aDom.href;
                    url = originPath + url.substr(url.indexOf('/vuldb/'), url.length);
                    let i = generateData(url, aDom.innerHTML, "seebug?????????", dDom.innerHTML, '',page);
                    L.push(i);
                }
            }
            list = L;
        })
    } catch (e){};
    if(list.length) console.log('search seebug ok');
    return list;
}

async function searchAnQuanKeCVE(key, page){
    let list = [];
    if (!page || !key) return false;
    try{
        await fetch(`https://api.anquanke.com/data/v1/search/vul?page=${page}&size=20&s=${encodeURI(key)}`, {
            method: 'GET',
            headers: new Headers({
                "Accept": "application/json; charset=utf-8"
            }),
        })
        .then(async res => {
            let originPath = 'https://www.anquanke.com/vul/id/';
            const {data} = await res.json();
            let L = [];
            if(data){
                for (let i of data){
                    let o = generateData(originPath + i.id, i.name, "?????????", i.updated, '',page);
                    L.push(o);
                }
            }
            list = L;
        })
    } catch (e){};
    if (list.length) console.log('search aqkcve ok');
    return list;
}

async function searchSaucsCVE(key, page){
    if (!page || !key) return false;
    let list = [];
    try{
        await fetch(`https://www.opencve.io/cve?cvss=&search=${encodeURI(key)}&page=${page}`)
        .then(async res => {
            let originPath = 'https://www.opencve.io';
            let html = await res.text();
            console.log(html);
            html = splitHtml(html, '<table class="table" id="cves">', '</table>');
            preDom.innerHTML = '<table class="table">' + html +'</table>';
            let trTDom = preDom.querySelectorAll('tbody > tr:nth-of-type(2n+1)');
            let trDDom = preDom.querySelectorAll('tbody > tr:nth-of-type(2n)');
            let L = [];
            if(trTDom.length && trDDom.length){
                for(let i = 0; i < trTDom.length; i++){
                    let item = trTDom[i];
                    let aDom = item.querySelector('td:nth-child(1) > a');
                    let dDom = item.querySelector('td.col-md-2.text-center');
                    let detail = trDDom[i].querySelector('td');
                    let url = aDom.href;
                    url = originPath + url.substr(url.indexOf('/cve/'), url.length);
                    let obj = generateData(url, aDom.innerHTML, url.replace("https://www.opencve.io/cve/", "") , dDom.innerHTML, detail.innerHTML, page);
                    L.push(obj);
                }
            }
            list = L;
        })
    } catch (e){};
    if(list.length) console.log('search saucs cve ok');
    return list;
}

async function searchFreebuf(key, page){
    let olist = [];
    if (!page || !key) return false;
    try{
        await fetch(`https://search.freebuf.com/search/find/?year=0&articleType=0&time=0&tabType=1&content=${encodeURI(key)}&page=${page}`, {
            method: 'GET',
            headers: new Headers({
                "Accept": "application/json; charset=utf-8"
            }),
        })
        .then(async res => {
            const {data:{list}} = await res.json();
            let L = [];
            if(list.length){
                for (let i of list){
                    let o = generateData(i.url, i.title, "freebuf", i.time, i.content, page);
                    L.push(o);
                }
            }
            olist = L;
        })
    } catch (e){};
    if (olist.length) console.log('search freebuf ok');
    return olist;
}

async function searchHacking8(key, page){
    let olist = [];
    try{
        await fetch(`https://i.hacking8.com/?s=${encodeURI(key)}&page=${page}`)
        .then(async res => {
            let originPath = 'https://i.hacking8.com/';
            let html = await res.text();
            html = '<table class="table">' + splitHtml(html, '<table class="table table-responsive">', '</table>') + '</table>';
            html = html.replace(/<img alt="..." class="media-object" src=".*?">/g, ""); // ??????????????????
            preDom.innerHTML = html;
            let trDom = preDom.querySelectorAll('tbody > tr');
            let L = [];
            if(trDom.length){
                for(let item of trDom){
                    const aDom = item.querySelector('td:nth-child(3) > div > div.link > a');
                    const time = item.querySelector('td:nth-child(1)');
                    const author = item.querySelector('td:nth-child(2) > a > span');
                    const summary = item.querySelector('td:nth-child(3) > div > div.media-body > pre');
                    const nhref = aDom.href;
                    const newhref = nhref.replace("chrome-extension://dlfmagkgiibkjpjlopikhamijaohdibi/", "");
                    let i = generateData(originPath + newhref, aDom.innerHTML, `hacking8 ${author.innerHTML}`, time.innerHTML, summary ? summary.innerHTML : '', page);
                    L.push(i);
                }
            }
            olist = L;
        })
    } catch (e){};
    if(olist.length)console.log('hacking8 ok');
    return olist;
}