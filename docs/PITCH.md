# Pitch for azentio.ai

## Opening (30 seconds)
"Every enterprise wants its clients to teach the product, but clients won't share what they know if they think it will leak. Most portals either lock everything down or share by accident. We built the middle path. Clients contribute, a person reviews, only a safe version is shared, and the client can pull it back in seconds. Access is enforced on the server, not in the menu."

## The problem (20 seconds)
- Valuable market insight sits with each client and never reaches product teams.
- Clients fear exposure of customer data, contract terms and their own identity.
- Naive community boards fail on tenant isolation, consent and withdrawal.

## The solution in one line
"Governed collective learning: private by default, reviewed by a person, counted fairly, withdrawable at any time."

## Live demo (about 4 minutes)
Use the **Judge walkthrough** button at bottom left. Steps 3 to 6 must run in order. Refresh the page before you start, because state lives in memory.

1. **Landing page (30s).** Point at the hero. "The moderator redacts the name, branch and account number, publishes the shared copy, and a theme unlocks at three organisations." Click a person in *Who can open what?* and show Lena, from another tenant, blocked.
2. **Security lab (30s).** Open the shield icon and run "Open an employee recording by its ID". "This hits the same API as the app. Hiding a menu item protects nothing, so the server decides on every request."
3. **Client, Ana (30s).** Show her private draft, the returned submission and the four separate permissions. "Joining a workspace isn't consent to share."
4. **Moderator, Maya (50s).** Open the Northwind submission and press Publish. It is blocked because identifiers remain. Redact, publish. "Only reviewed fields go public, never the source."
5. **Client, Lena (30s).** Open Shared learning. "Seasonality context" now shows three organisations with a small-sample warning, while "Document quality" stays hidden at two. "No single client can be inferred from a statistic."
6. **Product owner, Priya (30s).** Create an idea linked to the approved evidence and set it to Under review. "Clients see a plain-language status, not private tickets or promises."
7. **Withdrawal, Ana (30s).** Withdraw the contribution. The purge screen clears search, cache and AIRA retrieval, and the theme drops back below threshold. "We can't recall what someone already viewed, and we say so."
8. **Admin, Ravi (20s).** Even the administrator can't open a private record without a reason-backed, time-boxed authorisation, and the author is notified.

**Extras if time allows:** the AIRA demo on the landing page, where the answer shrinks when a source is withdrawn; the Federated lab with the poisoned participant switched on.

**Two-minute version:** opening, steps 1, 4, 5 and 7, then the close.

## Why this meets the brief
- **Server-side access:** role, tenant, audience and entitlement are checked together on every request, with deny by default.
- **Real lifecycle:** draft, submit, review, publish, return, reject, withdraw and report, with audited transitions.
- **Consent:** store, publish, attribute and train are four separate permissions, all off by default.
- **Withdrawal:** derived copies clear in milliseconds here, against a 60-second requirement.
- **Fair counting:** a minimum of three distinct organisations; repeat posts count once.
- **Federated track:** local training, clipped updates, poisoning checks, dropout handling and a human deployment decision with rollback.
- **Honest labelling:** queued email is never called delivered; no secure-aggregation or "untraining" claim.

## Say this up front: what is real and what is simulated
"The policy logic, lifecycle, index purge, cohort rules and invitation rules run for real inside the prototype. Identity, email delivery, media streams and the federated model are simulated and labelled as such. In production this becomes Entra ID with OIDC, NestJS guards over a database, a real mail provider and secure aggregation."

## Likely judge questions
- **Is access really enforced?** Yes. Every API call runs the policy check, and the security lab proves it live.
- **Is removing a name enough to anonymise?** No, and the brief says so too. A moderator reads every shared copy, regions and periods are broadened, and trends need three organisations. Production needs stronger suppression rules.
- **Is this federated learning?** Only the separate lab is. The community hub deliberately isn't.
- **Does withdrawal undo a trained model?** No. Programme rules decide that, and we don't promise untraining.
- **How does sign-in work?** A real email-code and invitation flow. Outside emails and unprovisioned employees are refused.

## Close (20 seconds)
"Public discovery, employee innovation, client collaboration. One loop where private observations become shared intelligence, and nobody's data leaves their control. That's azentio.ai."
