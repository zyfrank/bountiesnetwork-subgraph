import { BigInt, Bytes, Address, json } from "@graphprotocol/graph-ts";

import { BountyIssued, BountyActivated, BountyFulfilled, FulfillmentUpdated, FulfillmentAccepted, BountyKilled, ContributionAdded, DeadlineExtended, BountyChanged, IssuerTransferred, PayoutIncreased, IssueBountyCall, IssueAndActivateBountyCall, FulfillBountyCall, UpdateFulfillmentCall, ChangeBountyDeadlineCall, ChangeBountyDataCall, ChangeBountyFulfillmentAmountCall, ChangeBountyArbiterCall, IncreasePayoutCall, ActivateBountyCall, ContributeCall } from './types/BountiesNetwork/BountiesNetwork'

import { Bounty, Issuer, Contributor, Fulfillment, Fulfiller } from './types/schema'



export function handleBountyIssued(event: BountyIssued): void {
  //dummy
}

export function handleBountyActivated(event: BountyActivated): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.bountyStage = "Active"
    bounty.save()
  }
}

export function handleBountyFulfilled(event: BountyFulfilled): void {
  //todo

}

export function handleFulfillmentUpdated(event: FulfillmentUpdated): void {
  //dummy
}

export function handleFulfillmentAccepted(event: FulfillmentAccepted): void {
  //todo
}

export function handleBountyKilled(event: BountyKilled): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.bountyStage = "Dead"
  }
}

export function handleContributionAdded(event: ContributionAdded): void {
  //dummy
  /* let id = event.params.bountyId.toString()
   let bounty = Bounty.load(id)
   //bounty.balance = bounty.balance + event.params.value
   bounty.save()*/
}

export function handleDeadlineExtended(event: DeadlineExtended): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  if (bounty != null) {
    bounty.deadline = event.params.newDeadline
    bounty.save()
  }
}

export function handleBountyChanged(event: BountyChanged): void {
  //dummy
}

export function handleIssuerTransferred(event: IssuerTransferred): void {
  let id = event.params._bountyId.toString()
  let bounty = Bounty.load(id)
  if (bounty != null) {
    issuerAddBounty(event.params._newIssuer.toHexString(), event.params._bountyId)

    let issuer = Issuer.load(bounty.issuer)
    if ((issuer != null) && (issuer.bounties != null)) {
      let index = issuer.bounties.indexOf(event.params._bountyId)
      if (index >= 0) {
        issuer.bounties.splice(index, 1)
        issuer.number -= BigInt.fromI32(1)
      }
    }
    issuer.save()
    bounty.issuer = event.params._newIssuer.toHexString()
    bounty.save()
  }
}

export function handlePayoutIncreased(event: PayoutIncreased): void {
  // dummy
}


export function handleIssueBounty(call: IssueBountyCall): void {
  let id = call.outputs.value0.toString();
  let bounty = new Bounty(id)

  bounty.issuer = call.inputs._issuer.toHexString()
  bounty.deadline = call.inputs._deadline
  bounty.data = call.inputs._data
  bounty.fulfillmentAmount = call.inputs._fulfillmentAmount
  bounty.arbiter = call.inputs._arbiter
  bounty.paysTokens = call.inputs._paysTokens
  bounty.tokenContract = call.inputs._tokenContract
  bounty.balance = BigInt.fromI32(0)
  bounty.bountyStage = "Draft"
  bounty.save()
  issuerAddBounty(bounty.issuer, call.outputs.value0)
}

function issuerAddBounty(issuerId: String, bountyNo: BigInt): void {
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

export function handleIssueAndActivateBounty(call: IssueAndActivateBountyCall): void {
  let id = call.outputs.value0.toString();

  let bounty = new Bounty(id)
  bounty.issuer = call.inputs._issuer.toHexString()
  bounty.deadline = call.inputs._deadline
  bounty.data = call.inputs._data
  bounty.fulfillmentAmount = call.inputs._fulfillmentAmount
  bounty.arbiter = call.inputs._arbiter
  bounty.paysTokens = call.inputs._paysTokens
  bounty.tokenContract = call.inputs._tokenContract
  bounty.bountyStage = "Active"
  bounty.balance = call.inputs._value
  bounty.save()

  issuerAddBounty(bounty.issuer, call.outputs.value0)
  updateContributor(call.transaction.from, call.outputs.value0, call.inputs._value, bounty.tokenContract)
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
  //todo
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