import { BountyIssued, BountyActivated, BountyFulfilled, FulfillmentUpdated, FulfillmentAccepted, BountyKilled, ContributionAdded, DeadlineExtended, BountyChanged, IssuerTransferred, PayoutIncreased, IssueBountyCall} from './types/BountiesNetwork/BountiesNetwork'
import { Bounty } from './types/schema'


export function handleBountyIssued(event: BountyIssued): void {
  let bounty = new Bounty(event.params.bountyId.toString())
  bounty.save()
}

export function handleBountyActivated(event: BountyActivated): void {
  let id = event.params.bountyId.toString()
  let bounty = Bounty.load(id)
  bounty.issuer = event.params.issuer
  bounty.save()
}

export function handleBountyFulfilled(event: BountyFulfilled): void {

}

export function handleFulfillmentUpdated(event: FulfillmentUpdated): void {

}

export function handleFulfillmentAccepted(event: FulfillmentAccepted): void {

}

export function handleBountyKilled(event: BountyKilled): void {

}

export function handleContributionAdded(event: ContributionAdded): void {

}

export function handleDeadlineExtended(event: DeadlineExtended): void {

}

export function handleBountyChanged(event: BountyChanged): void {

}

export function handleIssuerTransferred(event: IssuerTransferred): void {

}

export function handlePayoutIncreased(event: PayoutIncreased): void {

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
  bounty.save()
  }
}

