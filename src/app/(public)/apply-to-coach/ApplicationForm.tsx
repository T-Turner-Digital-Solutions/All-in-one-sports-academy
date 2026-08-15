"use client";

import { useActionState } from "react";
import { submitContractorApplicationAction, type ContractorApplicationState } from "@/lib/actions/contractor";
import { Button } from "@/components/ui/Button";
import { FileUploadField } from "@/components/ui/FileUploadField";

const initialState: ContractorApplicationState = {};

export function ApplicationForm({ loggedIn }: { loggedIn: boolean }) {
  const [state, formAction, pending] = useActionState(submitContractorApplicationAction, initialState);

  if (state.success) {
    return (
      <div className="aio-card p-8 text-center">
        <p className="font-display text-2xl font-bold">Application Submitted</p>
        <p className="mt-3 text-aio-silver">
          STATUS: PENDING APPROVAL. Justin Woodall will review your application. You&apos;ll receive an
          account activation invitation by email if approved. Until then, you won&apos;t have access to
          coach or client information.
        </p>
      </div>
    );
  }

  const input = "w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <p className="font-display text-lg font-bold">Contact Information</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Full Name</label>
            <input name="fullName" required className={input} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input name="phone" type="tel" required className={input} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input name="email" type="email" required className={input} />
          </div>
          {!loggedIn ? (
            <div>
              <label className={label}>Create a Password</label>
              <input name="password" type="password" minLength={8} required className={input} />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label className={label}>Home Address</label>
            <input name="address" required className={input} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="font-display text-lg font-bold">Coaching Background</p>
        <div>
          <label className={label}>Sports Coached (comma separated)</label>
          <input name="sportsCoached" required placeholder="Football, Basketball" className={input} />
        </div>
        <div>
          <label className={label}>Training Specialties</label>
          <input name="trainingSpecialties" className={input} />
        </div>
        <div>
          <label className={label}>Positions Trained</label>
          <input name="positionsTrained" className={input} />
        </div>
        <div>
          <label className={label}>Years of Experience</label>
          <input name="yearsExperience" type="number" min={0} className={input} />
        </div>
        <div>
          <label className={label}>Biography</label>
          <textarea name="biography" rows={4} className={input} />
        </div>
        <div>
          <label className={label}>Coaching History</label>
          <textarea name="coachingHistory" rows={3} className={input} />
        </div>
        <div>
          <label className={label}>Certifications</label>
          <input name="certifications" className={input} />
        </div>
        <label className="flex items-center gap-2 text-sm text-aio-silver-light">
          <input type="checkbox" name="cprFirstAid" value="true" className="h-4 w-4" />
          I currently hold a valid CPR/First Aid certification
        </label>
        <div>
          <label className={label}>References (name / phone / relationship)</label>
          <textarea name="references" rows={3} className={input} />
        </div>
      </section>

      <section className="space-y-4">
        <p className="font-display text-lg font-bold">Availability & Location</p>
        <div>
          <label className={label}>Availability</label>
          <input name="availability" placeholder="e.g. Weekday evenings, Saturday mornings" className={input} />
        </div>
        <div>
          <label className={label}>Preferred Training Location</label>
          <input name="preferredLocation" className={input} />
        </div>
      </section>

      <section className="space-y-4">
        <p className="font-display text-lg font-bold">Emergency Contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Name</label>
            <input name="emergencyContactName" className={input} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input name="emergencyContactPhone" type="tel" className={input} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="font-display text-lg font-bold">Documents</p>
        <p className="text-xs text-aio-silver">
          Uploads are stored securely and are only visible to Academy administrators during review.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileUploadField name="doc_profile_photo" label="Profile Photo" />
          <FileUploadField name="doc_resume" label="Resume" />
          <FileUploadField name="doc_drivers_license" label="Driver's License / ID" />
          <FileUploadField name="doc_w9" label="W-9" />
          <FileUploadField name="doc_certificate" label="Coaching Certificate(s)" />
          <FileUploadField name="doc_cpr" label="CPR/First Aid Card" />
          <FileUploadField name="doc_background_check" label="Background Check Documentation" />
          <FileUploadField name="doc_insurance" label="Insurance Documentation" />
          <FileUploadField name="doc_ica" label="Independent Contractor Agreement" />
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm text-aio-silver-light">
        <input type="checkbox" name="backgroundCheckAuthorized" value="true" required className="mt-1 h-4 w-4" />
        I authorize All In One Sports Academy to conduct a background check as part of the coach
        application review process.
      </label>

      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
