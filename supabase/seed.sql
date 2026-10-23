-- ==============================================================================
-- BrightPath CRM — Demo Seed Data
-- File: supabase/seed.sql
-- Description: Fictional coaching academy student enquiries, follow-ups, & activities
-- Note: Safely associates with an existing profile if available, or leaves NULL.
-- ==============================================================================

DO $$
DECLARE
  v_counsellor_id UUID;
  v_lead_aarav UUID;
  v_lead_priya UUID;
  v_lead_rohan UUID;
  v_lead_ananya UUID;
  v_lead_vikram UUID;
  v_lead_sneha UUID;
BEGIN
  -- Grab the first profile if one exists (e.g. after owner registers)
  SELECT id INTO v_counsellor_id FROM public.profiles LIMIT 1;

  -- ----------------------------------------------------------------------------
  -- 1. INSERT LEADS
  -- ----------------------------------------------------------------------------
  -- Lead 1: Aarav Sharma (New)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at
  ) VALUES (
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '+91 98765 43210',
    'IIT-JEE Target 2027',
    'Website Enquiry',
    'New',
    v_counsellor_id,
    v_counsellor_id,
    'Enquired about 2-year classroom foundation program. Parent requested scholarship test syllabus.',
    now() - INTERVAL '2 days'
  ) RETURNING id INTO v_lead_aarav;

  -- Lead 2: Priya Patel (Contacted)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at
  ) VALUES (
    'Priya Patel',
    'priya.patel@example.com',
    '+91 98231 12345',
    'NEET Droppers Batch',
    'Walk-in Counselling',
    'Contacted',
    v_counsellor_id,
    v_counsellor_id,
    'Visited centre with father. Discussed biology faculty track record and hostel facilities.',
    now() - INTERVAL '4 days'
  ) RETURNING id INTO v_lead_priya;

  -- Lead 3: Rohan Deshmukh (Qualified)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at
  ) VALUES (
    'Rohan Deshmukh',
    'rohan.d@example.com',
    '+91 91234 56789',
    'Foundation Class 10',
    'Parent Referral',
    'Qualified',
    v_counsellor_id,
    v_counsellor_id,
    'Scored 88% in diagnostic screening test. Eligible for Tier-1 merit batch discount.',
    now() - INTERVAL '6 days'
  ) RETURNING id INTO v_lead_rohan;

  -- Lead 4: Ananya Gupta (Converted)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at
  ) VALUES (
    'Ananya Gupta',
    'ananya.g@example.com',
    '+91 99887 76655',
    'IIT-JEE Advanced Intensive',
    'Social Media Ad',
    'Converted',
    v_counsellor_id,
    v_counsellor_id,
    'Admission confirmed! Enrolment token fee paid online. Batch A-1 morning timings allotted.',
    now() - INTERVAL '10 days'
  ) RETURNING id INTO v_lead_ananya;

  -- Lead 5: Vikram Malhotra (Lost)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, lost_reason, notes, created_at
  ) VALUES (
    'Vikram Malhotra',
    'vikram.m@example.com',
    '+91 97766 55443',
    'NEET Weekend Batch',
    'Google Search',
    'Lost',
    v_counsellor_id,
    v_counsellor_id,
    'Joined competitor institute closer to residential area',
    'Parent decided on a coaching centre located within 2 km of residence due to commute concerns.',
    now() - INTERVAL '12 days'
  ) RETURNING id INTO v_lead_vikram;

  -- Lead 6: Sneha Reddy (New)
  INSERT INTO public.leads (
    full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at
  ) VALUES (
    'Sneha Reddy',
    'sneha.reddy@example.com',
    '+91 96543 21876',
    'Full Stack Web Development Bootcamp',
    'Campus Seminar',
    'New',
    v_counsellor_id,
    v_counsellor_id,
    'Final year B.Tech student interested in evening batches with placement assistance.',
    now() - INTERVAL '1 day'
  ) RETURNING id INTO v_lead_sneha;

  -- ----------------------------------------------------------------------------
  -- 2. INSERT FOLLOW-UPS
  -- ----------------------------------------------------------------------------
  -- Task 1: Overdue Task for Aarav
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, created_by, created_at
  ) VALUES (
    v_lead_aarav,
    v_counsellor_id,
    now() - INTERVAL '3 hours',
    'Call student and parent to explain entrance test pattern and timings.',
    'pending',
    v_counsellor_id,
    now() - INTERVAL '1 day'
  );

  -- Task 2: Upcoming Task for Priya (Today)
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, created_by, created_at
  ) VALUES (
    v_lead_priya,
    v_counsellor_id,
    now() + INTERVAL '4 hours',
    'Send WhatsApp reminder for campus faculty interaction appointment.',
    'pending',
    v_counsellor_id,
    now() - INTERVAL '1 day'
  );

  -- Task 3: Upcoming Task for Rohan (Tomorrow)
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, created_by, created_at
  ) VALUES (
    v_lead_rohan,
    v_counsellor_id,
    now() + INTERVAL '1 day',
    'Send fee breakdown quotation and installment plan via email.',
    'pending',
    v_counsellor_id,
    now() - INTERVAL '2 days'
  );

  -- Task 4: Completed Task for Ananya
  INSERT INTO public.follow_ups (
    lead_id, assigned_to, due_at, note, status, completed_at, created_by, created_at
  ) VALUES (
    v_lead_ananya,
    v_counsellor_id,
    now() - INTERVAL '5 days',
    'Verify transaction receipt and issue student ID card.',
    'completed',
    now() - INTERVAL '5 days' + INTERVAL '30 minutes',
    v_counsellor_id,
    now() - INTERVAL '6 days'
  );

  -- ----------------------------------------------------------------------------
  -- 3. INSERT ACTIVITIES (Audit History)
  -- ----------------------------------------------------------------------------
  -- Activities for Aarav
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES
    (v_lead_aarav, v_counsellor_id, 'lead_created', 'New enquiry captured via Website Enquiry form', '{"channel": "web_form"}'::jsonb, now() - INTERVAL '2 days'),
    (v_lead_aarav, v_counsellor_id, 'followup_scheduled', 'Overdue follow-up call scheduled by staff', '{"due_at": "today"}'::jsonb, now() - INTERVAL '1 day');

  -- Activities for Priya
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES
    (v_lead_priya, v_counsellor_id, 'lead_created', 'Enquiry registered during walk-in visit to centre', '{"walk_in": true}'::jsonb, now() - INTERVAL '4 days'),
    (v_lead_priya, v_counsellor_id, 'status_updated', 'Status transitioned from New to Contacted', '{"previous": "New", "next": "Contacted"}'::jsonb, now() - INTERVAL '3 days');

  -- Activities for Ananya
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES
    (v_lead_ananya, v_counsellor_id, 'lead_created', 'Enquiry received from Social Media campaign', '{"campaign": "jee_2027"}'::jsonb, now() - INTERVAL '10 days'),
    (v_lead_ananya, v_counsellor_id, 'status_updated', 'Status changed to Qualified after entrance exam', '{"score": 92}'::jsonb, now() - INTERVAL '7 days'),
    (v_lead_ananya, v_counsellor_id, 'status_updated', 'Enrolment fee cleared. Status converted to Converted', '{"receipt": "REC-9821"}'::jsonb, now() - INTERVAL '5 days');

  RAISE NOTICE 'Demo seed data inserted successfully: 6 leads, 4 follow-ups, and audit history.';
END $$;
