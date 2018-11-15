let publicStyle = document.createElement('style');
publicStyle.setAttribute('class', 'public-style');
document.getElementsByTagName('head')[0].appendChild(publicStyle);

export default {
    import(urls){
        let urlPromises = [];
        for(let url of urls){
            let urlPromise = new Promise(function(resolve, reject){
                let script =document.createElement('script');
                document.body.appendChild(script);
                script.onload = function(){
                    resolve();
                }
                script.onerror = function(){
                    reject();
                }
                script.src = url;
            });
            urlPromises.push(urlPromise);
        }
        return Promise.all(urlPromises);
    },
    addCSSStyle(stylestring){
        publicStyle.appendChild(document.createTextNode(stylestring))
    }
}