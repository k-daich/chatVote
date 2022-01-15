const STREAMER = 'Johnny';
const testText = [
	'【アンケ】さむいか？ 1:はい 2:いいえ',
	'【アンケ】さむいか？ 1:はい 2:いいえ3:aaa',
	'【アンケ】さむいか？ 1:はい 2:いいえ3:aaa4:ererere',
	'【アンケ】さむいか？ 1:はい',
	'【アンケ】さむいか？ 2:はい',
][0];

const quitRegist = (error, causeText) => {
	throw `cause : ${error} ||| text : ${causeText}`;
};

const parseQ = () => {
	let reqData = {
		theme: null,
		choice1: null,
		choice2: null,
		choice3: null,
		choice4: null,
		streamer: STREAMER,
	}
	const cut = (cutKey, text) => {
		let result = {
			cutBef: null,
			cutAf: null,
		};
		let idx = text.indexOf(cutKey);
		result.cutBef = text.substr(0, idx);
		result.cutAf = text.substr(idx + cutKey.length);
		console.log(`cutted. cutKey : ${cutKey}, cutBef : ${result.cutBef}, cutAf : ${result.cutAf}`);
		return result;
	};

	if (testText.startsWith('【アンケ】')) {
		if (testText.indexOf('1:') === -1 || testText.indexOf('2:') === -1) quitRegist('【アンケ】で必須な「1:」「2:」のどちらかが存在しない', testText);
		let t;
		t = testText.slice('【アンケ】'.length);
		let cutted = cut('1:', t);
		reqData.theme = cutted.cutBef;
		cutted = cut('2:', cutted.cutAf);
		reqData.choice1 = cutted.cutBef;
		if (cutted.cutAf.indexOf('3:') === -1) {
			reqData.choice2 = cutted.cutAf;
		}
		else {
			cutted = cut('3:', cutted.cutAf);
			reqData.choice2 = cutted.cutBef;
			if (cutted.cutAf.indexOf('4:') === -1) {
				reqData.choice3 = cutted.cutAf;
			}
			else {
				cutted = cut('4:', cutted.cutAf);
				reqData.choice3 = cutted.cutBef;
				reqData.choice4 = cutted.cutAf;
			}
		}
	}
	console.log(reqData);
	reqData.theme.trim();
	return reqData;
};

(async function() {
	await fetch(
		'https://os3-368-17171.vs.sakura.ne.jp/'
		, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(parseQ()),
			cache: "reload"
		}
	).then(
		response => response.text()
	).then(text => {
		console.dir(text);
	});
})();
