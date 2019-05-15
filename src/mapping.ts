import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";

import { IssueBountyCall, IssueAndActivateBountyCall, FulfillBountyCall, UpdateFulfillmentCall, ChangeBountyDeadlineCall, ChangeBountyDataCall, ChangeBountyFulfillmentAmountCall, ChangeBountyArbiterCall, IncreasePayoutCall, ActivateBountyCall, ContributeCall, AcceptFulfillmentCall, KillBountyCall, ExtendDeadlineCall, TransferIssuerCall } from './types/BountiesNetwork/BountiesNetwork'

import { Bounty, Issuer, Contributor, Fulfillment, Fulfiller } from './types/schema'

export function handleIssueBounty(call: IssueBountyCall): void {
  newBounty(call.outputs.value0.toString(), call.outputs.value0, call.inputs._issuer.toHexString(), call.inputs._deadline, call.inputs._data, call.inputs._fulfillmentAmount, call.inputs._arbiter, call.inputs._paysTokens, call.inputs._tokenContract, BigInt.fromI32(0), "Draft")

  issuerAddBounty(call.inputs._issuer.toHexString(), call.outputs.value0)
}

export function handleIssueAndActivateBounty(call: IssueAndActivateBountyCall): void {
  newBounty(call.outputs.value0.toString(), call.outputs.value0, call.inputs._issuer.toHexString(), call.inputs._deadline, call.inputs._data, call.inputs._fulfillmentAmount, call.inputs._arbiter, call.inputs._paysTokens, call.inputs._tokenContract, call.inputs._value, "Active")

  issuerAddBounty(call.inputs._issuer.toHexString(), call.outputs.value0)
  updateContributor(call.transaction.from, call.outputs.value0, call.inputs._value, call.inputs._tokenContract)
}

export function handleFulfillBounty(call: FulfillBountyCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    let fulfillmentIds = bounty.fulfillments
    let fulfillmentId = id + '_' + BigInt.fromI32(fulfillmentIds.length).toString()
    let fulfillment = new Fulfillment(fulfillmentId)
    let addr = call.transaction.from
    fulfillment.fulfiller = addr.toHexString()
    fulfillment.accepted = false
    fulfillment.data = call.inputs._data
    fulfillment.save()

    let fulfiller = Fulfiller.load(addr.toHexString())
    if (fulfiller == null) {
      fulfiller = new Fulfiller(addr.toHexString())
    }
    if (fulfiller.fulfillments == null) {
      fulfiller.fulfillments = [fulfillmentId]
      fulfiller.number = BigInt.fromI32(1)
    } else {
      fulfiller.fulfillments = fulfiller.fulfillments.concat([fulfillmentId])
      fulfiller.number += BigInt.fromI32(1)
    }
    fulfiller.save()

    if (bounty.fulfillments == null) {
      bounty.fulfillments = [fulfillmentId]
    } else {
      bounty.fulfillments = bounty.fulfillments.concat([fulfillmentId])
    }
    bounty.save()
  }
}

export function handleUpdateFulfillment(call: UpdateFulfillmentCall): void {
  let bountyId = call.inputs._bountyId.toString();
  let fulfillmentId = call.inputs._fulfillmentId.toString();
  let fulfillment = Fulfillment.load(bountyId + "_" + fulfillmentId)
  if (fulfillment != null) {
    fulfillment.data = call.inputs._data
    fulfillment.save()
  }
}

export function handleChangeBountyDeadline(call: ChangeBountyDeadlineCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.deadline = call.inputs._newDeadline
    bounty.save()
  }
}

export function handleChangeBountyData(call: ChangeBountyDataCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.data = call.inputs._newData
    bounty.save()
  }
}

export function handleChangeBountyFulfillmentAmount(call: ChangeBountyFulfillmentAmountCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.fulfillmentAmount = call.inputs._newFulfillmentAmount
    bounty.save()
  }
}

export function handleChangeBountyArbiter(call: ChangeBountyArbiterCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.arbiter = call.inputs._newArbiter
    bounty.save()
  }
}

export function handleIncreasePayout(call: IncreasePayoutCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.balance += call.inputs._value
    bounty.fulfillmentAmount = call.inputs._newFulfillmentAmount
    bounty.save()
    updateContributor(call.transaction.from, call.inputs._bountyId, call.inputs._value, bounty.tokenContract)
  }
}

export function handleActivateBounty(call: ActivateBountyCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.balance += call.inputs._value
    bounty.bountyStage = "Active"
    bounty.save()
    updateContributor(call.transaction.from, call.inputs._bountyId, call.inputs._value, bounty.tokenContract)
  }
}

export function handleContribute(call: ContributeCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.balance += call.inputs._value
    bounty.save()
    updateContributor(call.transaction.from, call.inputs._bountyId, call.inputs._value, bounty.tokenContract)
  }
}

export function handleAcceptFulfillment(call: AcceptFulfillmentCall): void {
  let bountyId = call.inputs._bountyId.toString();
  let fulfillmentId = call.inputs._fulfillmentId.toString();
  let fulfillment = Fulfillment.load(bountyId + "_" + fulfillmentId)
  if (fulfillment != null) {
    fulfillment.accepted = true
    fulfillment.save()
  }
}

export function handleKillBounty(call: KillBountyCall): void {
  let bountyId = call.inputs._bountyId.toString();
  let bounty = Bounty.load(bountyId)
  if (bounty != null) {
    bounty.bountyStage = "Dead"
    bounty.save()
  }
}

export function handleExtendDeadline(call: ExtendDeadlineCall): void {
  let bountyId = call.inputs._bountyId.toString();
  let bounty = Bounty.load(bountyId)
  if (bounty != null) {
    bounty.deadline = call.inputs._newDeadline
    bounty.save()
  }
}

export function handleTransferIssuer(call: TransferIssuerCall): void {
  let bountyId = call.inputs._bountyId.toString();
  let bounty = Bounty.load(bountyId)
  if (bounty != null) {
    issuerAddBounty(call.inputs._newIssuer.toHexString(), call.inputs._bountyId)

    let issuer = Issuer.load(bounty.issuer)
    if ((issuer != null) && (issuer.bounties != null)) {
      let index = issuer.bounties.indexOf(call.inputs._bountyId)
      if (index >= 0) {
        issuer.bounties.splice(index, 1)
        issuer.number -= BigInt.fromI32(1)
      }
    }
    issuer.save()

    bounty.issuer = call.inputs._newIssuer.toHexString()
    bounty.save()
  }
}

function newBounty(id: string, no: BigInt, issuer: string, deadline: BigInt, data: string, fulfillmentAmount: BigInt, arbiter: Bytes, paysTokens: boolean, tokenContract: Bytes, balance: BigInt, bountyStage: string): void {
  let bounty = new Bounty(id)
  bounty.no = no
  bounty.issuer = issuer
  bounty.deadline = deadline
  bounty.data = data
  bounty.fulfillmentAmount = fulfillmentAmount
  bounty.arbiter = arbiter
  bounty.paysTokens = paysTokens
  bounty.tokenContract = tokenContract
  bounty.balance = balance
  bounty.bountyStage = bountyStage
  bounty.save()
}

function issuerAddBounty(issuerId: string, bountyNo: BigInt): void {
  let issuer = Issuer.load(issuerId)
  if (issuer == null) {
    issuer = new Issuer(issuerId)
  }
  if (issuer.bounties == null) {
    issuer.bounties = [bountyNo]
    issuer.number = BigInt.fromI32(1)
  } else {
    issuer.bounties = issuer.bounties.concat([bountyNo])
    issuer.number += BigInt.fromI32(1)
  }
  issuer.save()
}

function updateContributor(addr: Address, bountyNo: BigInt, value: BigInt, tokenContract: Bytes): void {
  let contributor = Contributor.load(addr.toHexString())
  if (contributor == null) {
    contributor = new Contributor(addr.toHexString())
  }
  if (contributor.bounties == null) {
    contributor.bounties = [bountyNo]
    contributor.number = BigInt.fromI32(1)
    contributor.funds = [value]
    contributor.tokens = [tokenContract]
  } else {
    contributor.bounties = contributor.bounties.concat([bountyNo])
    contributor.number += BigInt.fromI32(1)
    contributor.funds = contributor.funds.concat([value])
    contributor.tokens = contributor.tokens.concat([tokenContract])
  }
  contributor.save()
}
