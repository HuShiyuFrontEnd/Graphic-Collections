export default {
    //浅拷贝
    setAttrs(target, setting){
        for(let p in setting){
            target[p] = setting[p];
        }
    },
    valueInRange(val,min,max){
        if(min!=undefined&&val<min)
            return min;
        if(max!=undefined&&val>max)
            return max;
        return val;
    },
    getBoundingBoxFromPoints(PointArray){
        let minX = 0,minY = 0,maxX = 0,maxY = 0;
        let length = PointArray.length;
        for(let i = 0;i < length;i++){
            let point = PointArray[i];
            maxX = Math.max(point[0], maxX);
            minX = Math.min(point[0], minX);
            maxY = Math.max(point[1], maxY);
            minY = Math.min(point[1], minY);
        }
        return [minX, minY, maxX, maxY];
    },
    log(context){
        console.log(`%c${context}`,'color:#2DA1F2')
    }
}