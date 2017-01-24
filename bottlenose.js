/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


BOTTLENOSE_SERVER = 'https://bottlenose.herokuapp.com';
SOCIAL_TEMPLATE_ROOT = 'social/'
if (typeof CHAMPAGNE_ROOT != 'undefined') {
  SOCIAL_TEMPLATE_ROOT = CHAMPAGNE_ROOT + 'social/';
}

var bottlenose = angular.module('reelyactive.bottlenose', [])

  .factory('bottlenose', function bottlenoseFactory($http) {

    var fetch = function(url, callback) {
      if(!url || (typeof url !== 'string')) {
        return false;
      }
      $http.defaults.headers.common.Accept = 'application/json, text/plain';
      $http.get(url)
        .success(function(data, status, headers, config) {
          callback(data);
        })
        .error(function(data, status, headers, config) {
          console.log('bottlenose: GET ' + url + ' returned status ' + status);
          return false;
        });
    };
    
    var ready = function(service) {
      var evt = document.createEvent("Event");
      evt.initEvent("ready", true, false);
      document.getElementsByTagName(service)[0].dispatchEvent(evt);
    }

    return {
      fetch: fetch,
      announceReady: ready 
    }
  })
  
  .directive('twitter', ['bottlenose', function(bottlenose) {
    
    function link(scope, element, attrs) {
      
      scope.tweets = [];
      
      function fetchContent() {
        var splitUrl = scope.url.split('twitter.com/');
        var username = splitUrl[splitUrl.length-1];
        var fetchUrl = BOTTLENOSE_SERVER + '/twitter/' + username;
        bottlenose.fetch(fetchUrl, afterFetch);
      }
      
      function afterFetch(rawTweets) {
        var cleanTweets = [];
        var user = {};
        if (rawTweets.length > 0) {
          user.name = rawTweets[0].user.name;
          user.username = rawTweets[0].user.screen_name
          user.bio = linkify(rawTweets[0].user.description);
        }
        angular.forEach(rawTweets, function(tweet, key) {
          var text = linkify(tweet.text);
          var timestamp = new Date(Date.parse(tweet.created_at));
          var permalink =
            'https://twitter.com/'+tweet.user.screen_name
            +'/status/'+tweet.id_str;
          var cleanTweet = {
            text: text,
            timestamp: timestamp,
            permalink: permalink
          };
          cleanTweets.push(cleanTweet);
        });
        scope.tweets = cleanTweets;
        scope.user = user;
        bottlenose.announceReady('twitter');
      }
      
      function linkify(text) {
        return Autolinker.link(parseHashtag(text));
      }
      
      function parseHashtag(text) {
        return text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
          var tag = t.replace("#","")
          var link = 
            '<a href="http://twitter.com/hashtag/'+tag
            +'" target="_blank">'+t+'</a>'
          return link;
        });
      }
      
      scope.$watch(attrs.url, function() {
        fetchContent();
      });
    }

    return {
      restrict: "E",
      scope: {
        url: "="
      },
      link: link,
      templateUrl: SOCIAL_TEMPLATE_ROOT+'twitter.html'
    }
  }]);
  
bottlenose.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
  
var Autolinker={htmlRegex:/<(\/)?(\w+)(?:(?:\s+\w+(?:\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g,prefixRegex:/^(https?:\/\/)?(www\.)?/,link:function(h,d){d=d||{};var k=Autolinker.htmlRegex,r=Autolinker.matcherRegex,i=("newWindow" in d)?d.newWindow:true,e=("stripPrefix" in d)?d.stripPrefix:true,a=d.truncate,g=("twitter" in d)?d.twitter:true,o=("email" in d)?d.email:true,s=("urls" in d)?d.urls:true,j,q=0,b,m="",l=0;function f(t){t=t.replace(r,function(O,A,x,w,v,u){var E=A,D=x,L=w,y=v,F=u,C="",B="",M=[];var G=O.charAt(O.length-1);if(G===")"){var z=O.match(/\(/g),J=O.match(/\)/g),N=(z&&z.length)||0,K=(J&&J.length)||0;if(N<K){O=O.substr(0,O.length-1);B=")"}}var I=O,H=O;if((E&&!g)||(y&&!o)||(F&&!s)){return C+H+B}if(E){C=D;I="https://twitter.com/"+L;H="@"+L}else{if(y){I="mailto:"+y;H=y}else{if(!/^[A-Za-z]{3,9}:/i.test(I)){I="http://"+I}}}if(e){H=H.replace(Autolinker.prefixRegex,"")}if(H.charAt(H.length-1)==="/"){H=H.slice(0,-1)}M.push('href="'+I+'"');if(i){M.push('target="_blank"')}if(a&&H.length>a){H=H.substring(0,a-2)+".."}return C+"<a "+M.join(" ")+">"+H+"</a>"+B});return t}while((j=k.exec(h))!==null){var n=j[0],c=j[2],p=!!j[1];b=h.substring(q,j.index);q=j.index+n.length;if(c==="a"){if(!p){l++;m+=f(b)}else{l--;if(l===0){m+=b}}}else{if(l===0){m+=f(b)}}m+=n}if(q<h.length){m+=f(h.substring(q))}return m}};Autolinker.matcherRegex=/((^|\s)@(\w{1,15}))|((?:[\-;:&=\+\$,\w\.]+@)[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b)|((?:(?:(?:[A-Za-z]{3,9}:(?:\/\/)?)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:(?:www\.)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b))(?:[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|])?)/g;
