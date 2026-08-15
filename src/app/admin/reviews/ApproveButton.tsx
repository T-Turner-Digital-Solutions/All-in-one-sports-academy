"use client";

import { toggleReviewApprovalAction } from "@/lib/actions/adminReviews";
import { Button } from "@/components/ui/Button";

export function ApproveButton({ reviewId, approved }: { reviewId: string; approved: boolean }) {
  return (
    <form action={async () => toggleReviewApprovalAction(reviewId)}>
      <Button type="submit" size="sm" variant={approved ? "outline" : "primary"}>
        {approved ? "Unpublish" : "Approve for Public Display"}
      </Button>
    </form>
  );
}
