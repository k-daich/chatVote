console.dir('run vote observer');

document.getElementsByXPath = function(expression) {
	var r = []
	var x = document.evaluate(expression, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
	for (var i = 0, l = x.snapshotLength; i < l; i++) {
		r.push(x.snapshotItem(i))
	}
	return r
}

const msListElement = document.getElementsByXPath('//div[@id=\'message-list-container\']/div[@class=\'message-list\']')[0];
var msList = msListElement.children;

const observer = new MutationObserver(function() {
	console.dir('DOMが変化しました');
	console.dir(msList[msList.length - 1].textContent);
});

/** 監視時のオプション */
const config = {
	attributes: false,
	childList: true,
	characterData: false
};

observer.observe(msListElement, config);
