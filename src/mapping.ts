import { BigInt, json} from "@graphprotocol/graph-ts";

import { BountyIssued, BountyActivated, BountyFulfilled, FulfillmentUpdated, FulfillmentAccepted, BountyKilled, ContributionAdded, DeadlineExtended, BountyChanged, IssuerTransferred, PayoutIncreased, IssueBountyCall, IssueAndActivateBountyCall, FulfillBountyCall, UpdateFulfillmentCall, ChangeBountyDeadlineCall, ChangeBountyDataCall, ChangeBountyFulfillmentAmountCall, ChangeBountyArbiterCall, IncreasePayoutCall, ActivateBountyCall, ContributeCall} from './types/BountiesNetwork/BountiesNetwork'

import { Bounty, Issuer, Contributer, Fulfillment, Fulfiller} from './types/schema'



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
  if(bounty != null) {
    bounty.bountyStage ="Dead"
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
  if (bounty != null){
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
  if (bounty != null){
    let issuer = Issuer.load(event.params._newIssuer.toHexString())
    if (issuer == null){
      issuer = new Issuer(event.params._newIssuer.toHexString())
    }
    if (issuer.bounties == null)
    {
      issuer.bounties = [event.params._bountyId]
      issuer.number = BigInt.fromI32(1)
    }else{
       issuer.bounties = issuer.bounties.concat([event.params._bountyId])
       issuer.number += BigInt.fromI32(1)
    }
    issuer.save()

    issuer = Issuer.load(bounty.issuer.toHexString())
    if ((issuer != null) && (issuer.bounties!= null)){
      let index = issuer.bounties.indexOf(event.params._bountyId)
      if (index >= 0){
        issuer.bounties.splice(index, 1)
        issuer.number -= BigInt.fromI32(1)
      }
    }
    issuer.save()

    bounty.issuer = event.params._newIssuer
    bounty.save()
  }
}

export function handlePayoutIncreased(event: PayoutIncreased): void {
// dummy
}


export function handleIssueBounty(call: IssueBountyCall): void {
  let id = call.outputs.value0.toString();
  let bounty = new Bounty(id)

  bounty.issuer = call.inputs._issuer
  bounty.deadline = call.inputs._deadline
  bounty.data = call.inputs._data
  bounty.fulfillmentAmount = call.inputs._fulfillmentAmount
  bounty.arbiter = call.inputs._arbiter
  bounty.paysTokens = call.inputs._paysTokens
  bounty.balance = BigInt.fromI32(0) 
  bounty.bountyStage = "Draft"
  bounty.save()

  let issuer = Issuer.load(bounty.issuer.toHexString())
  if (issuer == null){
    issuer = new Issuer(bounty.issuer.toHexString())
    
  }
  if (issuer.bounties == null)
  {
    issuer.bounties = [call.outputs.value0]
    issuer.number = BigInt.fromI32(1)
  }else{
     issuer.bounties = issuer.bounties.concat([call.outputs.value0])
     issuer.number += BigInt.fromI32(1)
  }
  issuer.save()

}

export function handleIssueAndActivateBounty(call: IssueAndActivateBountyCall): void {
  let id = call.outputs.value0.toString();
  
  let bounty = new Bounty(id)
  bounty.issuer = call.inputs._issuer
  bounty.deadline = call.inputs._deadline
  bounty.data = call.inputs._data
  bounty.fulfillmentAmount = call.inputs._fulfillmentAmount
  bounty.arbiter = call.inputs._arbiter
  bounty.paysTokens = call.inputs._paysTokens
  bounty.bountyStage = "Active"
  bounty.balance = call.inputs._value
  bounty.save()

  let issuer = Issuer.load(bounty.issuer.toHexString())
  if (issuer == null){
    issuer = new Issuer(bounty.issuer.toHexString())
  }
  if (issuer.bounties == null)
  {
    issuer.bounties = [call.outputs.value0]
    issuer.number = BigInt.fromI32(1)
  }else{
     issuer.bounties = issuer.bounties.concat([call.outputs.value0])
     issuer.number += BigInt.fromI32(1)
  }
  issuer.save()


}

export function handleFulfillBounty(call: FulfillBountyCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    let fulfillmentIds = bounty.fulfillments
    let fulfillmentId = id + '_' + BigInt.fromI32(fulfillmentIds.length).toString()
    let fulfillment = new Fulfillment(fulfillmentId)
    let addr = call.transaction.from
    fulfillment.fulfiller = addr
    fulfillment.accepted = false 
    fulfillment.data = call.inputs._data
    fulfillment.save()

    let fulfiller = Fulfiller.load(addr.toHexString())
    if (fulfiller == null){
      fulfiller = new Fulfiller(addr.toHexString())
    }
    if (fulfiller.fulfillments == null){
      fulfiller.fulfillments = [fulfillmentId]
      fulfiller.number = BigInt.fromI32(1)
    }else{
      fulfiller.fulfillments = fulfiller.fulfillments.concat([fulfillmentId])
      fulfiller.number += BigInt.fromI32(1)
    }
    fulfiller.save()

    if (bounty.fulfillments == null){
      bounty.fulfillments = [fulfillmentId]
    }else{
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

export function handleActivateBounty(call: ActivateBountyCall): void {
  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.balance += call.inputs._value
    bounty.save()
  }
}

export function handleContribute(call: ContributeCall): void {

  let id = call.inputs._bountyId.toString();
  let bounty = Bounty.load(id)
  if (bounty != null){
    bounty.balance += call.inputs._value
    bounty.save()

    let addr = call.transaction.from.toHexString()
    let contributer = Contributer.load(addr)
    if (contributer == null){
      contributer = new Contributer(addr)
    }
    if (contributer.bounties == null){
      contributer.bounties = [call.inputs._bountyId]
      contributer.number = BigInt.fromI32(1)
    }else{
      contributer.bounties = contributer.bounties.concat([call.inputs._bountyId])
      contributer.number += BigInt.fromI32(1)
    }
    contributer.save()
  }
}