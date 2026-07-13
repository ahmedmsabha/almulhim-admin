# Smoke Testing Guide

This guide describes manual verification steps for each core flow in the Mulhim Admin Web application. Use these steps to check that the client frontend and backend API integration function correctly.

## 1. Authentication and Authorization (Clerk)

* **Sign Out Verification**:
  1. Open a browser window.
  2. Navigate directly to `/dashboard`.
  3. Confirm you are redirected to the sign in page.
* **Role Check (Non Admin)**:
  1. Sign in with a user account that does not have the admin role.
  2. Confirm that you are redirected to `/forbidden` and see the access denied message.
* **Admin Access**:
  1. Sign in with a verified admin account.
  2. Confirm you are redirected to the admin dashboard.

## 2. Admin Dashboard

* **Real Data Load**:
  1. Navigate to `/dashboard`.
  2. Check that the four key performance indicators (KPIs) show real values.
  3. Verify that the subscription growth line chart and region distribution progress bars render correctly.
* **Recent Activity**:
  1. Check the activity table at the bottom of the page.
  2. Confirm it displays recent actions, such as approved receipts or resets.

## 3. Student and Device Management

* **Directory List**:
  1. Go to `/students`.
  2. Type a name in the search bar and verify that the table filters.
  3. Filter by region and verify the rows update.
* **Student Detail**:
  1. Click a student row.
  2. Confirm the page loads `/students/[userId]` showing student details.
  3. Check the device bindings section (web and mobile slots).
* **Device Reset**:
  1. Click the reset icon for a device.
  2. Confirm that the verification dialog appears.
  3. Approve the dialog and check that the slot updates to show an empty state.

## 4. Plans Configuration

* **Plans Table**:
  1. Navigate to `/plans`.
  2. Verify that all subscription plans load with their correct prices.
* **Edit Plan**:
  1. Click the edit action on a plan.
  2. Modify the price or toggle the active switch.
  3. Save and confirm the toast notification shows success.
* **Create Plan**:
  1. Click the add plan button.
  2. Fill out the plan details.
  3. Confirm the new plan appears in the table.

## 5. Subscriptions Queue and Receipt Review

* **Pending Queue**:
  1. Navigate to `/subscriptions`.
  2. Verify that the list displays pending receipt uploads.
* **Receipt Review**:
  1. Click the view action on a pending subscription.
  2. Review the receipt image on the left.
  3. Check the artificial intelligence verification indicators.
  4. Click Approve, Reject, or Suspend.
  5. Check that the success toast appears and you return to the queue.

## 6. Content Tree and Media Uploads

* **Hierarchy Navigation**:
  1. Go to `/content`.
  2. Expand units and chapters to view the tree.
  3. Use the search bar to filter lessons.
* **Media Upload**:
  1. Select a lesson.
  2. Drag and drop a video (up to 1 gigabyte) or a document (up to 50 megabytes) in the lesson panel.
  3. Confirm the upload progress bar displays until the upload completes.

## 7. Announcements Composer

* **Announcements View**:
  1. Navigate to `/announcements`.
  2. Select an announcement from the history table to edit, or fill out the new composer.
* **RTL Support**:
  1. Type Arabic text into the announcement body textarea.
  2. Confirm the text aligns right to left.
* **Targeting and Image**:
  1. Select target regions.
  2. Upload an banner image.
  3. Click Save and toggle the publish switch.

## 8. Support Inbox

* **Support Thread**:
  1. Go to `/support`.
  2. Select an open ticket from the left pane list.
  3. Verify the chat bubble alignment (Arabic text shows right to left).
* **Reply and Close**:
  1. Type a response in the composer.
  2. Click Reply and verify the success toast.
  3. Click Close and confirm the ticket status updates.
