import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../../generated/Spot/Spot";
import { Maker, Collateral } from "../../generated/schema";

import { saveChange } from "../utils";

export function handleFile(event: LogNote): void {
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let whatString = dataString.substr(74, 64);
	let govDataString = dataString.substr(138, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let whatBytes = ByteArray.fromHexString(whatString);
	let govDataBytes = ByteArray.fromHexString(govDataString).reverse();

	let ilk = ilkBytes.toString();
	let what = whatBytes.toString();
	let govData = BigInt.fromSignedBytes(govDataBytes as Bytes);

	if (what.toString() == 'mat') {
		let collateral = Collateral.load(ilk.toString());
		collateral.minRatio = govData;
		collateral.save();
	}

	let param = 'Spot-' + ilk + '-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}
