# Database Structure (MongoDB + Mongoose)

Six collections. `ObjectId` fields are references (foreign keys).

## users
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key (`user_id`) |
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | **bcrypt hash**, never returned by the API |
| role | String | `student` (default) or `admin` |
| createdAt | Date | |

## courses
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | `course_id` |
| title, description, category, instructor | String | required |
| duration | String | e.g. "6 weeks" |
| difficulty | String | Beginner / Intermediate / Advanced |
| image | String | optional image URL |
| createdAt, updatedAt | Date | |

## modules
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | `module_id` |
| course | ObjectId → courses | indexed |
| title | String | required |
| description, notes | String | |
| resources | [{ label, type, url }] | type: notes, pdf, video, reference, code, exercise, link |
| order | Number | `module_order`, modules are listed by this |

## enrollments
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | `enrollment_id` |
| student | ObjectId → users | |
| course | ObjectId → courses | |
| enrollmentDate | Date | default now |
| completedModules | [ObjectId → modules] | |
| progress | Number | 0-100, recalculated by the server |
| status | String | `active` / `completed` |
| completedAt | Date | set when progress reaches 100 |

Unique index on `(student, course)` prevents duplicate enrollments.

## assignments
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | `assignment_id` |
| course | ObjectId → courses | indexed |
| title | String | required |
| description, instructions | String | |
| deadline | Date | required |
| maxMarks | Number | default 100 |

## submissions
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | `submission_id` |
| assignment | ObjectId → assignments | |
| course | ObjectId → courses | denormalised for fast filtering |
| student | ObjectId → users | |
| text | String | typed answer |
| link, linkType | String | GitHub / Drive / project URL (`github`, `drive`, `project`, `other`) |
| file | { path, originalName } | uploaded file (stored in `backend/uploads`) |
| submissionDate | Date | |
| isLate | Boolean | set when submitted after the deadline |
| marks | Number | null until graded |
| feedback | String | |
| status | String | `submitted` / `under_review` / `graded` |

Unique index on `(assignment, student)`: one submission per student, re-submittable until graded.

## Relationships
```
users 1─* enrollments *─1 courses 1─* modules
                          courses 1─* assignments 1─* submissions *─1 users
```

## Progress calculation
`progress = round(completedModules ∩ currentModules / totalModules × 100)`.
It is recomputed whenever a student toggles a module, and for every enrollment of a course when a module is added or deleted.
