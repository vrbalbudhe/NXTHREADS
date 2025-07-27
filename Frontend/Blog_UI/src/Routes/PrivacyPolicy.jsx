import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-2 text-gray-200">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-2">
          Welcome to MakeMyBlog. We are committed to protecting your personal
          information and your right to privacy. This privacy policy explains
          what information we collect, how we use it, and what rights you have
          in relation to it.
        </p>
        <p className="mb-2">
          If you have any questions or concerns about our policy, or our
          practices with regards to your personal information, please contact us
          at{" "}
          <Link to="/contact" className="text-blue-500">
            contact us
          </Link>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          How We Use Your Information
        </h2>
        <p className="mb-2">
          We use personal information collected via our website for a variety of
          business purposes described below. We process your personal
          information for these purposes in reliance on our legitimate business
          interests, in order to enter into or perform a contract with you, with
          your consent, and/or for compliance with our legal obligations.
        </p>
        <p className="mb-2">We use the information we collect or receive:</p>
        <ul className="list-disc ml-8">
          <li className="mb-2">
            To facilitate account creation and logon process.
          </li>
          <li className="mb-2">
            To send you marketing and promotional communications.
          </li>
          <li className="mb-2">To send administrative information to you.</li>
          <li className="mb-2">To fulfill and manage your orders.</li>
          <li className="mb-2">To post testimonials.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Will Your Information Be Shared with Anyone?
        </h2>
        <p className="mb-2">
          We only share and disclose your information in the following
          situations:
        </p>
        <ul className="list-disc ml-8">
          <li className="mb-2">
            Compliance with Laws: We may disclose your information where we are
            legally required to do so in order to comply with applicable law,
            governmental requests, a judicial proceeding, court order, or legal
            process.
          </li>
          <li className="mb-2">
            Vital Interests and Legal Rights: We may disclose your information
            where we believe it is necessary to investigate, prevent, or take
            action regarding potential violations of our policies, suspected
            fraud, situations involving potential threats to the safety of any
            person and illegal activities, or as evidence in litigation in which
            we are involved.
          </li>
          <li className="mb-2">
            Business Transfers: We may share or transfer your information in
            connection with, or during negotiations of, any merger, sale of
            company assets, financing, or acquisition of all or a portion of our
            business to another company.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          How Long Do We Keep Your Information?
        </h2>
        <p className="mb-2">
          We keep your information for as long as necessary to fulfill the
          purposes outlined in this privacy policy unless otherwise required by
          law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Do We Make Updates to This Policy?
        </h2>
        <p className="mb-2">
          We may update this privacy policy from time to time. The updated
          version will be indicated by an updated “Revised” date and the updated
          version will be effective as soon as it is accessible.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
