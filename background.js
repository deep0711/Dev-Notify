//Background-Script
var arr=[
"codechef.com",
"hackerearth.com",
"codeforces.com",
"topcoder.com",
"hackerrank.com",
"yukicoder.me",
"atcoder.jp",
"leetcode.com",
"codingcompetitions.withgoogle.com"
]
console.log("Background Script is Running")

var platform={
    "codechef.com":'',
    "hackerearth.com":'',
    "codeforces.com":'',
    "topcoder.com":'',
    "hackerrank.com":'',
    "yukicoder.me":'',
    "atcoder.jp":'',
    "leetcode.com":'',
    "codingcompetitions.withgoogle.com":''
}

var platform_image={
    "codechef.com":'images/cc.png',
    "hackerearth.com":'images/he.png',
    "codeforces.com":'images/cf.png',
    "topcoder.com":'images/tc.png',
    "hackerrank.com":'images/hr.png',
    "yukicoder.me":'images/yc.png',
    "atcoder.jp":'images/ac.png',
    "leetcode.com":'images/lc.png',
    "codingcompetitions.withgoogle.com":'images/google.png'
}
chrome.runtime.onStartup.addListener(function () {
    //console.log("Due to Chrome Starting");
    notifier();
})
chrome.alarms.onAlarm.addListener(function(alarm) { 
    //console.log("Due to Alram");
    notifier();
})

    
    
function notifier(){        
    chrome.notifications.getAll((items) => {
        if ( items ) {
            for (let key in items) {
                chrome.notifications.clear(key);
            }
        }
      });
    
    
    for(let i=0;i<arr.length;i++)
    {
        chrome.storage.sync.get([arr[i]], function(result) {

            if(!result[arr[i]])
            {
                return;
            }
            if(result[arr[i]].substring(9,10)=='t')
                platform[arr[i]]=true;
            else if(result[arr[i]].substring(9,10)=='f')
                platform[arr[i]]=false;    

            if(i==(arr.length-1))
            {
                //console.log(platform)
                var today=new Date();                
                var todayDate=today.toISOString();

                var tomorrow=new Date();
                tomorrow.setDate(new Date().getDate()+2)
                var lastDate=tomorrow.toISOString();
                
                //console.log(todayDate);
                //console.log(lastDate);
                let url="https://clist.by/api/v1/contest/?username=XXXX&api_key=XXXX"+todayDate+"&start__lt="+lastDate+"&order_by=start";
                
                fetch(url).then(res=>res.json()).then(result => {
                    console.log(result);
                    
                    for(let j=0;j<result["meta"]["total_count"];j++)
                    {
                        let event = result["objects"][j]["event"];
                        let link = result["objects"][j]["href"]
                        let start = result["objects"][j]["start"]
                        let key = String(result["objects"][j]["id"]);
                        let end=result["objects"][j]["end"];

                        let testPrefs = JSON.stringify({
                            'event':event,
                            'link':link,
                            'start':start,
                            'end':end,
                            'remind':true,
                            'platform':result["objects"][j]["resource"]["name"],
                            "id":key
                        })
                        
                        
                        let jsonfile={};
                        jsonfile[key]=testPrefs;
                        
                        chrome.storage.sync.get([key],(result2)=>{ 

                            if(!result2[key] && platform[result["objects"][j]["resource"]["name"]])  
                            {
                                //console.log(jsonfile);
                                chrome.storage.sync.set( jsonfile, function() {
                                });
                            }
                        

                            if(j==result["meta"]["total_count"]-1)
                            {
                                chrome.storage.sync.get(function(result){
                                    //console.log(result);
                                    let res=Object.keys(result);
                                    
                                    for(let k=0;k<res.length;k++)
                                    {
                                        let obj=JSON.parse(result[res[k]]);
                                        
                                        if(obj["start"])
                                        {
                                            let today=new Date();
                                            today=today.toISOString();
                                            
                                            //console.log(!platform[obj["platform"]]);

                                            if(obj["end"]<today || !platform[obj["platform"]] )
                                            {
                                                //console.log("ajsd");
                                                chrome.storage.sync.remove([res[k]],function(){
                                                });
                                            }
                                        }
                                        
                                        if(k==(res.length-1))
                                        {
                                            chrome.storage.sync.get(function(result){
                                                let res=Object.keys(result);
                                                for(let k=0;k<res.length;k++)
                                                {
                                                    let obj=JSON.parse(result[res[k]]);
                                                    
                                                    if(obj["remind"])
                                                    {
                                                        //console.log(obj);
                                                        var event_time=obj["start"]+'Z'
                                                        //console.log(event_time);
                                                        var event_date=new Date(event_time);
                                                        event_date=event_date.toString();
                                                        //console.log(event_date.substring(0,26));
                                                        var notifOptions = {
                                                            type: "basic",
                                                            iconUrl:platform_image[obj["platform"]],
                                                            title: "Coding Contest Reminder",
                                                            message: obj["event"],
                                                            contextMessage:"Event Date&Time:"+event_date.substring(0,25),
                                                            buttons:[{
                                                                title:"Take me there"                                                                
                                                            },{
                                                                title:"Don't show this contest again"
                                                            }]
                                                        };    
                                                        //console.log("Do");
                                                        let r = obj["id"]
                                                        chrome.notifications.create(r, notifOptions);
                                                    }           
                                                }              
                                            })
                                        }
                                    }
                                    
                                })
                            }
                        });
                    }    
                })
            }
        });
    }
}

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    chrome.storage.sync.get(function(result){
        let res=Object.keys(result);
        //console.log("Clicked Id:",notifId);

        for(let k=0;k<res.length;k++)
        {
            let obj=JSON.parse(result[res[k]]);
            if(obj["id"]==notifId)
            {
                if(btnIdx==0)
                {
                    window.open(obj["link"]);
                }
                else if(btnIdx==1)
                {
                    //console.log("Dont Like");
                    
                    let event = obj["event"];
                    let link = obj["link"];
                    let start = obj["start"];
                    let key = obj["id"];
                    let end=obj["end"];
                    
                    let testPrefs = JSON.stringify({
                        'event':event,
                        'link':link,
                        'start':start,
                        'end':end,
                        'remind':false,
                        'platform':obj["platform"],
                        "id":key
                    })
                    let jsonfile={};
                    jsonfile[key]=testPrefs;
                    
                    chrome.storage.sync.set( jsonfile, function() {
                    });   
                }
            }
        }
    })
})
