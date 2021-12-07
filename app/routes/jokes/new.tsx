import type { ActionFunction } from "remix";
import { redirect, useActionData } from "remix";
import { db } from "~/utils/db.server";

function validateJokeName(name: string) {
  if(name.length < 3) {
    return "Joke name must be at least 3 characters long";
  }
}

function validateJokeContent(content: string) {
  if(content.length < 10) {
    return "Joke content must be at least 10 characters long";
  }
}

type ActionData = {
  formError?: string,
  fields?: { name?: string, content?: string },
  fieldErrors?: { name?: string, content?: string },
}

export const action: ActionFunction = async ({
  request
}): Promise<Response | ActionData> => {
  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");
  // we do this type check to be extra sure and to make TypeScript happy
  // we'll explore validation next!
  if (
    typeof name !== "string" ||
    typeof content !== "string"
  ) {
    return { formError: "Form not submitted correctly." };
  }

  let fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content)
  }
  // check if fielError are truthy 
  if (Object.keys(fieldErrors).some(Boolean)) {
    return {fieldErrors, fields: {name, content}}
  }

  const fields = { name, content };

  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              defaultValue={actionData?.fields?.name}
              name="name"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.name) ||
                undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              role="alert"
              id="name-error"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) ||
                undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}