# -*- coding: utf-8 -*- #
# Copyright 2024 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""`gcloud domains registrations google-domains-dns get-forwarding-config` command."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from googlecloudsdk.api_lib.domains import registrations
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.domains import resource_args
from googlecloudsdk.command_lib.domains import util


@base.DefaultUniverseOnly
class GetForwardingConfig(base.DescribeCommand):
  """Get forwarding configuration of a specific Cloud Domains registration.

  Get forwarding configuration (deprecated) of a specific registration.

  ## EXAMPLES

  To get forwarding configuration of ``example.com'', run:

    $ gcloud domains registrations google-domains-dns get-forwarding-config
    example.com
  """

  @staticmethod
  def Args(parser):
    resource_args.AddRegistrationResourceArg(
        parser, 'to get the forwarding config for'
    )

  def Run(self, args):
    """Run get forwarding config command."""
    api_version = registrations.GetApiVersionFromArgs(args)
    client = registrations.RegistrationsClient(api_version)
    args.registration = util.NormalizeResourceName(args.registration)
    registration_ref = args.CONCEPTS.registration.Parse()
    registration = client.Get(registration_ref)
    util.AssertRegistrationOperational(api_version, registration)

    return client.RetrieveGoogleDomainsForwardingConfig(registration_ref)
