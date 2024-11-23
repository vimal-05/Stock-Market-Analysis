const Stocks = ['AAPL' ,'MSFT' ,'GOOGL' ,'AMZN' ,'PYPL', 'TSLA' ,'JPM' ,'NVDA', 'NFLX', 'DIS'];
const dateRanges = ['5y' , '1y' ,'3mo','1mo'];
let charts = document.getElementById("charts");
let description = document.getElementById("description");
let descContent = document.getElementById("description-content");
let descHeading = document.getElementById("description-heading");
let companiesList = document.getElementById("companies-list");
let timePeriod = document.getElementById("time-period");
let stocksProfileData , stocksStatsData , stocksData ;
let currCompany = Stocks[0];
let dateRange = dateRanges[0];

getData();



async function getData(){
    let stocksProfileResponse = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata");
    let stocksProfileJson = await stocksProfileResponse.json();
    stocksProfileData = await stocksProfileJson.stocksProfileData[0];
    // console.log("stocksProfile",stocksProfileData[currCompany].summary);
    

    let stocksStatsResponse = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata");
    let stocksStatsJson = await stocksStatsResponse.json();
    stocksStatsData = stocksStatsJson.stocksStatsData[0]; 
    // console.log(stocksStatsData);
    

    let stocksResponse = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata");
    let stocksJson = await stocksResponse.json();
    stocksData = stocksJson.stocksData[0];
    // console.log(stocksData[currCompany][dateRange]);


    let nameText = "";
    let bookvalueText = "";
    let profitText = "";
    for(let stock of Stocks){
        nameText =nameText +`<div id="${stock}">${stock}</div>`
        bookvalueText=bookvalueText +`<div id="${stock}bookvalue">${stocksStatsData[stock].bookValue}</div>`
        profitText= profitText + `<div id="${stock}profit">${stocksStatsData[stock].profit}</div>`;   
    }
    document.getElementById("company-names").innerHTML=nameText;
    document.getElementById("company-bookvalue").innerHTML=bookvalueText;
    document.getElementById("company-profit").innerHTML=profitText;

    for(let stock of Stocks){
        let stockButton = document.getElementById(`${stock}`);
        stockButton.addEventListener("click",()=>{
            showCompanyDetails(stock);
            currCompany=stock; 
            showCharts();
        });
        if(stocksStatsData[stock].profit>0){
            document.getElementById(`${stock}profit`).style.color="green";
        }
        else{
            document.getElementById(`${stock}profit`).style.color="red";
        }
    }

    let dateText=``;
    for(let item of dateRanges){
        dateText =dateText+`<div id="${item}">${item}</div>`;   
    }
    timePeriod.innerHTML=dateText;
    for(let item of dateRanges){
        let timePeriodButton = document.getElementById(`${item}`);
        timePeriodButton.addEventListener("click",()=>{
            dateRange=item;
            showCompanyDetails(currCompany); 
            showCharts();
        });
        
    }


    showCompanyDetails(currCompany);
    showCharts();
}



function showCompanyDetails(company){
    
    descHeading.innerHTML= `<div id="${company}">${company}</div>
    <div id="book-value">${stocksStatsData[company].bookValue}</div>
    <div id="profit">${stocksStatsData[company].profit}</div>`;
    if(stocksStatsData[company].profit>0){
        document.getElementById("profit").style.color="green";
    }
    else{
        document.getElementById("profit").style.color="red";
    }
    descContent.innerText = stocksProfileData[company].summary;
}

function showCharts(){
    charts.innerHTML="";
    let values = stocksData[currCompany][dateRange]["value"];
    let dates = stocksData[currCompany][dateRange]["timeStamp"];

    let currWidth = parseFloat(getComputedStyle(charts).width);
    let gap = currWidth/values.length;
    // let currHeight = parseFloat(getComputedStyle(charts).height);
    let currHeight = 450;

    let horzValue = 0;
    let prev = 0;
    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);


    for(let i in values){
        
        let valPerc =Math.abs((values[i]-minValue)/(maxValue-minValue));
        let vertValue = currHeight/1.5-(currHeight/2*valPerc);
        let  svgElem= document.createElementNS("http://www.w3.org/2000/svg","svg");
        svgElem.style.width=`${gap}`;
        svgElem.style.height="450px";
        svgElem.classList=["svg"];
        charts.appendChild(svgElem);
        if(i==0){
            prev=vertValue;
        }
        let line = document.createElementNS("http://www.w3.org/2000/svg","line");

        line.setAttribute("x1",0);
        line.setAttribute("x2",gap);
        line.setAttribute("y1",prev);
        line.setAttribute("y2",vertValue);

        let tooltipText = document.createElement("span");
        tooltipText.style.visibility = "hidden";
        tooltipText.style.textAlign="center";
        tooltipText.style.borderRadius = "6px";
        tooltipText.style.padding="5px 0";
        tooltipText.style.color="white";
        tooltipText.style.position="absolute";
        tooltipText.style.fontSize="smaller";
        tooltipText.style.zIndex="1";
        charts.appendChild(tooltipText);
        
        svgElem.addEventListener("mouseover",()=>{
            line.style.stroke="white";
            tooltipText.style.visibility = "visible";
        });
        svgElem.addEventListener("mouseout",()=>{
            line.style.stroke="green";
            tooltipText.style.visibility="hidden"
        })

        tooltipText.innerText=`${currCompany}  ${values[i]}`;
        svgElem.appendChild(line);
        horzValue+=gap;
        prev= vertValue;
    }
}
