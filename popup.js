document.addEventListener('DOMContentLoaded', function() {
    
    let form = document.getElementById('form');

    form.addEventListener('submit', function(e){
            e.preventDefault();
            for(let i=0;i<9;i++)
            {
                let value = e.target[i].checked;
                let key = String(e.target[i].value);
                let testPrefs = JSON.stringify({
                    'value':value
                })
                let jsonfile={};
                jsonfile[key]=testPrefs;

                chrome.storage.sync.set( jsonfile, function() {
                    //console.log(jsonfile);
                    
                    if(i==8)
                    {    
                        chrome.alarms.create("API-hit-time", {delayInMinutes: 0.1, periodInMinutes: 180}  );
                        alert('Updated Successfully!')
                        window.close();
                    }
                  });
            }
    })

    var modal = document.getElementById("myModal");
    var btn = document.getElementById("help");
    var span = document.getElementsByClassName("close")[0];
    btn.onclick = function() {
        
        modal.style.display = "block";
    }
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
        modal.style.display = "none";
        }
    }


  }, false);

