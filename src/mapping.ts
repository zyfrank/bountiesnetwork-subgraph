import {
  BigInt
} from "@graphprotocol/graph-ts";

import { BountyIssued, BountyActivated, BountyFulfilled, FulfillmentUpdated, FulfillmentAccepted, BountyKilled, ContributionAdded, DeadlineExtended, BountyChanged, IssuerTransferred, PayoutIncreased, IssueBountyCall, IssueAndActivateBountyCall, FulfillBountyCall, UpdateFulfillmentCall, ChangeBountyDeadlineCall, ChangeBountyDataCall, ChangeBountyFulfillmentAmountCall, ChangeBountyArbiterCall, IncreasePayoutCall} from './types/BountiesNetwork/BountiesNetwork'
import { Bounty } from './types/schema'



export function handleBountyIssued(event: BountyIssued): void {
//dummy
}

export function handleBountyActivated(event: BountyActivated): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  bounty.bountyStage = "Active"
  bounty.save()
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
  bounty.bountyStage ="Dead"
}

export function handleContributionAdded(event: ContributionAdded): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  bounty.balance = bounty.balance + event.params.value
  bounty.save()
}

export function handleDeadlineExtended(event: DeadlineExtended): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  bounty.deadline = event.params.newDeadline
  bounty.save()

}

export function handleBountyChanged(event: BountyChanged): void {
 //dummy
}

export function handleIssuerTransferred(event: IssuerTransferred): void {
  let id = event.params._bountyId.toString()
  let bounty = Bounty.load(id)
  bounty.issuer = event.params._newIssuer
  bounty.save()
}

export function handlePayoutIncreased(event: PayoutIncreased): void {
// dummy
}


export function handleIssueBounty(call: IssueBountyCall): void {
  let id = call.outputs.value0.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
  bounty.issuer = call.inputs._issuer
  bounty.deadline = call.inputs._deadline
  bounty.data = call.inputs._data
  bounty.fulfillmentAmount = call.inputs._fulfillmentAmount
  bounty.arbiter = call.inputs._arbiter
  bounty.paysTokens = call.inputs._paysTokens
  bounty.bountyStage = "Draft"
  bounty.save()
  }
}

export function handleIssueAndActivateBounty(call: IssueAndActivateBountyCall): void {
  let id = call.outputs.value0.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
  bounty.issuer = call.inputs._issuer
  bounty.deadline = call.inputs._deadline
  bounty.data = call.inputs._data
  bounty.fulfillmentAmount = call.inputs._fulfillmentAmount
  bounty.arbiter = call.inputs._arbiter
  bounty.paysTokens = call.inputs._paysTokens
 // bounty.balance = BignInt.fromI32(0) 
  bounty.bountyStage = "Active"
  bounty.balance = call.inputs._value
  bounty.save()
  }
}

export function handleFulfillBounty(call: FulfillBountyCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    let fulfillments = bounty.fulfillments
    //fulfillments.filter(item.bountyId.toString() === id)
    bounty.save()
  }
}


export function handleUpdateFulfillment(call: UpdateFulfillmentCall): void {
  //todo
}


export function handleChangeBountyDeadline(call: ChangeBountyDeadlineCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.deadline = call.inputs._newDeadline
    bounty.save()
  }
}

export function handleChangeBountyData(call: ChangeBountyDataCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.data = call.inputs._newData
    bounty.save()
  }
}

export function handleChangeBountyFulfillmentAmount(call: ChangeBountyFulfillmentAmountCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.fulfillmentAmount = call.inputs._newFulfillmentAmount
    bounty.save()
  }
}

export function handleChangeBountyArbiter(call: ChangeBountyArbiterCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.arbiter = call.inputs._newArbiter
    bounty.save()
  }
}

export function handleIncreasePayout(call: IncreasePayoutCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.balance += call.inputs._value
    bounty.fulfillmentAmount = call.inputs._newFulfillmentAmount
    bounty.save()
  }
}