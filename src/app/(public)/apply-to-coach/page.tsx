import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ApplicationForm } from "./ApplicationForm";

export const metadata = { title: "Join the AIO Coaching Team" };

const STATUS_LABEL: Record<string, string> = {
  APPLICANT: "Applicant",
  PENDING_REVIEW: "Pending Review",
  MORE_INFO_REQUIRED: "More Information Required",
  APPROVED: "Approved",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  INACTIVE: "Inactive",
  DENIED: "Denied",
};

export default async function ApplyToCoachPage() {
  const session = await auth();
  const existingApplication = session
    ? await prisma.contractorApplication.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Careers" title="Join the AIO Coaching Team" light />
        <p className="mt-4 text-aio-silver-light/80">
          All In One Sports Academy is always looking for certified, passionate coaches. Submit an
          application below — Justin Woodall personally reviews every submission. You will not gain
          access to coach or client information until your application is approved.
        </p>

        {existingApplication ? (
          <div className="mt-10 aio-card p-8">
            <p className="font-display text-xl font-bold">Application Status</p>
            <p className="mt-2 text-3xl font-bold text-aio-red">
              {STATUS_LABEL[existingApplication.status] ?? existingApplication.status}
            </p>
            <p className="mt-4 text-sm text-aio-silver">
              Submitted {existingApplication.submittedAt.toLocaleDateString()}.
              {existingApplication.reviewerNotes ? (
                <>
                  <br />
                  Reviewer notes: {existingApplication.reviewerNotes}
                </>
              ) : null}
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <ApplicationForm loggedIn={Boolean(session)} />
          </div>
        )}
      </Container>
    </section>
  );
}
